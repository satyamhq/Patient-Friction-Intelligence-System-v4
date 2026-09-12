import axios from 'axios';
import { Hospital, IHospital } from '../models/Hospital.js';
import { HospitalDepartment } from '../models/HospitalDepartment.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';
import { config } from '../config/env.js';

interface DiscoveredPlace {
  name: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
  type: 'Government' | 'Private' | 'Charitable' | 'Autonomous';
  isEmergency: boolean;
}

export class RealHospitalDiscoveryService {
  private static cachedHospitals: Map<string, { timestamp: number; hospitals: any[] }> = new Map();

  /**
   * Reverse geocodes coordinates to get city, state, and area name
   */
  public static async reverseGeocode(lat: number, lng: number): Promise<{
    city: string;
    state: string;
    displayName: string;
    pincode: string;
  }> {
    try {
      const res = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: { lat, lon: lng, format: 'json' },
        headers: { 'User-Agent': 'PFIS-Healthcare-Intelligence-Platform/1.0' },
        timeout: 4000,
      });

      const addr = res.data?.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.suburb ||
        addr.county ||
        addr.state_district ||
        'Local City';
      const state = addr.state || 'Punjab';
      const pincode = addr.postcode || '144401';
      const displayName = res.data?.display_name || `${city}, ${state}`;

      return { city, state, displayName, pincode };
    } catch (err: any) {
      console.warn('[RealHospitalDiscovery] Reverse geocoding fallback:', err.message);
      return {
        city: 'Local Area',
        state: 'Punjab',
        displayName: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        pincode: '144401',
      };
    }
  }

  /**
   * Discovers real-world hospitals using Google Places API (if key available) or OpenStreetMap Nominatim
   */
  public static async discoverRealHospitals(lat: number, lng: number, radiusKm: number = 25): Promise<DiscoveredPlace[]> {
    const discovered: DiscoveredPlace[] = [];
    const seenNames = new Set<string>();

    // 1. If Google Maps API Key is configured in .env, attempt Google Places Nearby Search
    if (config.googleMapsApiKey && config.googleMapsApiKey.trim() !== '') {
      try {
        const radiusMeters = Math.min(radiusKm * 1000, 50000);
        const googleUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=hospital&key=${config.googleMapsApiKey}`;
        const gRes = await axios.get(googleUrl, { timeout: 4000 });

        if (gRes.data?.status === 'OK' && Array.isArray(gRes.data.results)) {
          for (const item of gRes.data.results) {
            const name = item.name;
            if (name && !seenNames.has(name.toLowerCase())) {
              seenNames.add(name.toLowerCase());
              const isGovt = /civil|govt|government|aiims|pgi|district|esi|chc|phc/i.test(name);
              discovered.push({
                name,
                lat: item.geometry.location.lat,
                lng: item.geometry.location.lng,
                address: item.vicinity || item.formatted_address || name,
                city: 'Local District',
                state: 'State',
                pincode: '144401',
                type: isGovt ? 'Government' : 'Private',
                isEmergency: true,
              });
            }
          }
        }
      } catch (gErr: any) {
        console.warn('[RealHospitalDiscovery] Google Places API unavailable, falling back to OSM:', gErr.message);
      }
    }

    // 2. Query OpenStreetMap Nominatim for real live hospitals near coordinates
    try {
      const geoInfo = await this.reverseGeocode(lat, lng);
      const searchQueries = [
        `hospital near ${geoInfo.city}`,
        `civil hospital ${geoInfo.city}`,
        `hospital near ${lat.toFixed(3)}, ${lng.toFixed(3)}`,
      ];

      for (const query of searchQueries) {
        if (discovered.length >= 12) break;

        try {
          const osmRes = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
              q: query,
              format: 'json',
              addressdetails: 1,
              limit: 12,
            },
            headers: { 'User-Agent': 'PFIS-Healthcare-Intelligence-Platform/1.0' },
            timeout: 4500,
          });

          if (Array.isArray(osmRes.data)) {
            for (const item of osmRes.data) {
              const rawName = item.name || item.display_name?.split(',')[0];
              if (!rawName) continue;
              const name = rawName.trim();
              const lowerName = name.toLowerCase();

              if (!seenNames.has(lowerName)) {
                seenNames.add(lowerName);
                const itemLat = parseFloat(item.lat);
                const itemLng = parseFloat(item.lon);
                const addrObj = item.address || {};
                const isGovt = /civil|govt|government|aiims|district|esi|chc|phc/i.test(name);

                discovered.push({
                  name,
                  lat: itemLat,
                  lng: itemLng,
                  address: item.display_name?.split(',').slice(1, 4).join(',').trim() || `${geoInfo.city}, ${geoInfo.state}`,
                  city: addrObj.city || addrObj.town || geoInfo.city,
                  state: addrObj.state || geoInfo.state,
                  pincode: addrObj.postcode || geoInfo.pincode,
                  phone: addrObj.phone || '01824-220000',
                  type: isGovt ? 'Government' : 'Private',
                  isEmergency: true,
                });
              }
            }
          }
        } catch {
          // proceed to next query
        }
      }
    } catch (osmErr: any) {
      console.warn('[RealHospitalDiscovery] OSM discovery error:', osmErr.message);
    }

    return discovered;
  }

  /**
   * Persists discovered hospitals into the database with demonstration departments,
   * doctor rosters, and initial token capacities for operational simulation.
   */
  public static async syncDiscoveredHospitalsToDatabase(
    discoveredList: DiscoveredPlace[]
  ): Promise<IHospital[]> {
    const savedHospitals: IHospital[] = [];

    // System hospital admin user fallback
    let defaultHospUser = await User.findOne({ role: 'hospital' });
    if (!defaultHospUser) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash('Hospital@123', salt);
      defaultHospUser = await User.create({
        name: 'Live Facility Supervisor',
        email: 'livefacility@pfis.org',
        passwordHash: hash,
        role: 'hospital',
        phone: '+91 98765 43210',
        isActive: true,
      });
    }

    const defaultDoctorNames = [
      { name: 'Dr. Gurpreet Singh, MD Medicine', dept: 'General Medicine' },
      { name: 'Dr. Raman Chawla, MS Ortho', dept: 'Orthopedics' },
      { name: 'Dr. Manpreet Kaur, MD Gynae', dept: 'Obstetrics & Gynaecology' },
      { name: 'Dr. Harvinder Sodhi, DM Cardio', dept: 'Cardiology' },
      { name: 'Dr. Simranjit Bhasin, MD Paed', dept: 'Pediatrics' },
      { name: 'Dr. Navneet Varma, MS Surgery', dept: 'Emergency & Trauma' },
    ];

    for (const d of discoveredList) {
      try {
        // Check if hospital with matching name or close coordinates already exists
        let existing = await Hospital.findOne({
          $or: [
            { name: d.name },
            {
              latitude: { $gte: d.lat - 0.001, $lte: d.lat + 0.001 },
              longitude: { $gte: d.lng - 0.001, $lte: d.lng + 0.001 },
            },
          ],
        });

        if (!existing) {
          const totalBeds = d.type === 'Government' ? 250 : 120;
          const availableBeds = Math.round(totalBeds * 0.28);

          existing = await Hospital.create({
            userId: defaultHospUser._id,
            name: d.name,
            type: d.type,
            tagline: `${d.type} Verified Healthcare Facility - 24/7 Emergency Care`,
            address: d.address,
            city: d.city,
            state: d.state,
            pincode: d.pincode,
            latitude: d.lat,
            longitude: d.lng,
            geoJSON: {
              type: 'Point',
              coordinates: [d.lng, d.lat],
            },
            phone: d.phone || '+91 1824-260000',
            emergencyPhone: '108 / +91 1824-260108',
            email: `contact@${d.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.org`,
            workingHours: '24/7 Emergency & Inpatient Care',
            emergencyAvailable: d.isEmergency,
            totalBeds,
            availableBeds,
            specialistAvailable: true,
            diagnosticFacilities: ['Digital X-Ray', 'Ultrasound', 'Pathology Lab', 'ECG', 'Emergency ICU'],
            languagesSupported: ['Punjabi', 'Hindi', 'English'],
            averageWaitTimeMinutes: d.type === 'Government' ? 25 : 15,
            rating: 4.5,
            isVerified: true,
            ambulanceService: {
              totalAmbulances: 4,
              availableAmbulances: 2,
              emergencyContact: '108',
              avgEtaMins: 12,
              isAvailable: true,
            },
            careAttendantService: {
              availableEscorts: 5,
              escortTypeName: 'Swasthya Sahayak Care Escort',
              homePickupDropAvailable: true,
              contactNumber: '+91 98765 11223',
              isAvailable: true,
            },
          });

          // Create active departments and doctors for this real hospital
          const departmentsToCreate = [
            { name: 'General Medicine', fee: d.type === 'Government' ? 10 : 300, cap: 60, avail: 28 },
            { name: 'Emergency & Trauma', fee: d.type === 'Government' ? 0 : 500, cap: 40, avail: 15 },
            { name: 'Orthopedics', fee: d.type === 'Government' ? 10 : 400, cap: 45, avail: 18 },
            { name: 'Cardiology', fee: d.type === 'Government' ? 20 : 600, cap: 35, avail: 14 },
            { name: 'Pediatrics', fee: d.type === 'Government' ? 10 : 350, cap: 50, avail: 22 },
          ];

          for (let i = 0; i < departmentsToCreate.length; i++) {
            const deptInfo = departmentsToCreate[i];
            const doc = defaultDoctorNames[i % defaultDoctorNames.length];
            await HospitalDepartment.create({
              hospitalId: existing._id,
              name: deptInfo.name,
              description: `Real-time active ${deptInfo.name} clinical outpatient and inpatient care services.`,
              headDoctorName: doc.name,
              opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              opdTimings: '09:00 AM - 04:00 PM',
              dailyTokenCapacity: deptInfo.cap,
              availableTokensToday: deptInfo.avail,
              consultationFee: deptInfo.fee,
              isAcceptingRequests: true,
            });
          }
        }

        savedHospitals.push(existing);
      } catch (err: any) {
        console.warn(`[RealHospitalDiscovery] Skipped hospital ${d.name}:`, err.message);
      }
    }

    return savedHospitals;
  }
}
