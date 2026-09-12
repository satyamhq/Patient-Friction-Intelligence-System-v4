import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Hospital } from '../models/Hospital.js';
import { HospitalDepartment } from '../models/HospitalDepartment.js';
import { Patient } from '../models/Patient.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';
import { GoogleMapsService } from '../services/googleMapsService.js';
import { TranslationService } from '../services/translationService.js';
import { AuditService } from '../services/auditService.js';
import { RealHospitalDiscoveryService } from '../services/realHospitalDiscoveryService.js';

async function ensureHospitalDepartments(hospitalId: string) {
  let depts = await HospitalDepartment.find({ hospitalId });
  if (!depts || depts.length === 0) {
    const hosp = await Hospital.findById(hospitalId);
    const hospName = (hosp?.name || '').toLowerCase();

    if (hospName.includes('lpu') || hospName.includes('unicenter')) {
      // LPU UniCenter specific medical staff & clinical roster
      depts = [
        await HospitalDepartment.create({
          hospitalId,
          name: 'General Medicine & Health Screening',
          department: 'General Medicine',
          headDoctorName: 'Dr. Sourabh Mukherjee, MBBS, MD (Chief Medical Officer)',
          head_doctor_name: 'Dr. Sourabh Mukherjee, MBBS, MD (Chief Medical Officer)',
          opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opdTimings: '08:30 AM - 04:30 PM',
          dailyTokenCapacity: 80,
          availableTokensToday: 42,
          consultationFee: 0,
          description: 'Primary triage, acute infections, non-clinical journey navigation, and comprehensive checkups.',
          treatedConditions: [
            'Viral Fever, Flu & Dengue',
            'Diabetes & Blood Sugar Care',
            'Blood Pressure & Hypertension',
            'Asthma, Cough & Allergies',
            'Stomach Infections & Typhoid',
            'Emergency First Aid & Triage',
          ],
          isAcceptingRequests: true,
        }),
        await HospitalDepartment.create({
          hospitalId,
          name: 'Outpatient Clinic & Student Health',
          department: 'Outpatient Clinic',
          headDoctorName: 'Dr. Neha Agarwal, MD (Consultant Physician)',
          head_doctor_name: 'Dr. Neha Agarwal, MD (Consultant Physician)',
          opdDays: ['Monday', 'Wednesday', 'Friday'],
          opdTimings: '09:00 AM - 02:00 PM',
          dailyTokenCapacity: 45,
          availableTokensToday: 24,
          consultationFee: 0,
          description: 'Consultation for common ailments, chronic disease follow-ups, and student/staff preventive medicine.',
          treatedConditions: [
            'Migraine & Severe Headache',
            'Skin Rashes & Dermatitis',
            'Digestive Health & Gastritis',
            'Nutritional Deficiencies & Anemia',
            'Travel & Routine Vaccinations',
          ],
          isAcceptingRequests: true,
        }),
        await HospitalDepartment.create({
          hospitalId,
          name: 'Sports Medicine & Joint Care',
          department: 'Orthopedics',
          headDoctorName: 'Dr. Sandeep Rathore, MS Ortho (Sports Injury Specialist)',
          head_doctor_name: 'Dr. Sandeep Rathore, MS Ortho (Sports Injury Specialist)',
          opdDays: ['Tuesday', 'Thursday', 'Saturday'],
          opdTimings: '10:00 AM - 03:00 PM',
          dailyTokenCapacity: 35,
          availableTokensToday: 18,
          consultationFee: 150,
          description: 'Management of athletic injuries, sprains, fractures, backache, and physical rehabilitation.',
          treatedConditions: [
            'Sports Sprains & Muscle Strains',
            'Bone Fractures & X-Ray Review',
            'Knee, Ankle & Joint Pain',
            'Ligament & Tendon Injuries',
            'Back Pain & Spinal Posture',
          ],
          isAcceptingRequests: true,
        }),
      ];
    } else {
      // Primary Verified Civil Hospital Phagwara medical roster
      depts = [
        await HospitalDepartment.create({
          hospitalId,
          name: 'General Medicine & Geriatric Screening',
          department: 'General Medicine',
          headDoctorName: 'Dr. Raman Chawla, MBBS, MD (Senior Physician)',
          head_doctor_name: 'Dr. Raman Chawla, MBBS, MD (Senior Physician)',
          opdDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opdTimings: '09:00 AM - 02:00 PM',
          dailyTokenCapacity: 60,
          availableTokensToday: 28,
          consultationFee: 0,
          description: 'Comprehensive screening for fevers, diabetes, hypertension, and geriatric care.',
          treatedConditions: [
            'Viral Fever, Dengue & Malaria',
            'Diabetes Mellitus Type 1 & 2',
            'High BP & Hypertension Management',
            'Respiratory Infections & Asthma',
            'Typhoid & Gastrointestinal Care',
            'Geriatric Elderly Health Checks',
          ],
          isAcceptingRequests: true,
        }),
        await HospitalDepartment.create({
          hospitalId,
          name: 'Cardiology & Heart Care',
          department: 'Cardiology',
          headDoctorName: 'Dr. Gurpreet Singh, MD, DM Cardiology',
          head_doctor_name: 'Dr. Gurpreet Singh, MD, DM Cardiology',
          opdDays: ['Monday', 'Wednesday', 'Friday'],
          opdTimings: '10:00 AM - 03:00 PM',
          dailyTokenCapacity: 35,
          availableTokensToday: 15,
          consultationFee: 0,
          description: 'Advanced non-invasive cardiac evaluation, ECG, 2D Echo, and coronary care.',
          treatedConditions: [
            'Acute Chest Pain & Angina',
            'Heart Attack Emergency',
            'High Blood Pressure / Hypertension',
            'Heart Failure & Palpitations',
            'Coronary Artery Disease',
            'Cholesterol & Lipid Management',
          ],
          isAcceptingRequests: true,
        }),
        await HospitalDepartment.create({
          hospitalId,
          name: 'Orthopedics & Joint Care',
          department: 'Orthopedics',
          headDoctorName: 'Dr. Harpreet Gill, MS Ortho, DNB',
          head_doctor_name: 'Dr. Harpreet Gill, MS Ortho, DNB',
          opdDays: ['Tuesday', 'Thursday', 'Saturday'],
          opdTimings: '09:30 AM - 01:30 PM',
          dailyTokenCapacity: 30,
          availableTokensToday: 12,
          consultationFee: 0,
          description: 'Joint replacement, trauma care, fracture management, and spine rehabilitation.',
          treatedConditions: [
            'Knee & Joint Arthritis',
            'Bone Fractures & Accident Trauma',
            'Slipped Disc & Sciatica',
            'Joint & Knee Replacement Care',
            'Chronic Back & Neck Pain',
            'Ligament Tears & Sports Injury',
          ],
          isAcceptingRequests: true,
        }),
      ];
    }
  }
  return depts;
}

export class HospitalController {
  public static async getNearby(req: Request, res: Response): Promise<void> {
    try {
      const lat = parseFloat(req.query.lat as string) || 31.2229;
      const lng = parseFloat(req.query.lng as string) || 75.7725;
      const radiusKm = parseFloat(req.query.radiusKm as string) || 50;
      const type = req.query.type as string;
      const emergencyOnly = req.query.emergency === 'true';
      const departmentFilter = req.query.department as string;
      const searchQuery = TranslationService.normalizeSearchQuery(
        (req.query.search as string || req.query.q as string || '').trim().toLowerCase()
      );

      const query: any = {};
      if (type && type !== 'All') {
        query.type = type;
      }
      if (emergencyOnly) {
        query.emergencyAvailable = true;
      }

      let allHospitals = await Hospital.find(query);

      // Check if we have nearby hospitals within radius
      const localCount = allHospitals.filter((h: any) => {
        const d = FrictionEngine.calculateHaversineDistance(lat, lng, h.latitude, h.longitude);
        return d <= Math.max(radiusKm, 35);
      }).length;

      // If fewer than 5 hospitals exist near the user's real GPS coordinates,
      // discover real live hospitals from OpenStreetMap / Google Places immediately!
      if (localCount < 5) {
        try {
          const discovered = await RealHospitalDiscoveryService.discoverRealHospitals(lat, lng, Math.max(radiusKm, 30));
          if (discovered && discovered.length > 0) {
            await RealHospitalDiscoveryService.syncDiscoveredHospitalsToDatabase(discovered);
            allHospitals = await Hospital.find(query);
          }
        } catch (discErr) {
          console.warn('[HospitalController] Real hospital discovery error:', discErr);
        }
      }

      // Compute distances, departments, doctor lists, and token seat capacity
      const hospitalsWithDetails = await Promise.all(
        allHospitals.map(async (hosp: any) => {
          const distResult = await GoogleMapsService.calculateDistance(
            lat,
            lng,
            hosp.latitude,
            hosp.longitude
          );

          let accessibilityFriction = 'LOW';
          if (distResult.distanceKm > 40) accessibilityFriction = 'HIGH';
          else if (distResult.distanceKm > 15) accessibilityFriction = 'MEDIUM';

          let depts = await HospitalDepartment.find({ hospitalId: hosp._id });
          if (!depts || depts.length === 0) {
            depts = await ensureHospitalDepartments(hosp._id);
          }

          // Calculate aggregated OPD token/seat availability
          const totalAvailableTokens = depts.reduce(
            (sum: number, d: any) => sum + (d.availableTokensToday ?? d.available_tokens ?? 25),
            0
          );
          const totalDailyTokens = depts.reduce(
            (sum: number, d: any) => sum + (d.dailyTokenCapacity ?? d.total_daily_tokens ?? 50),
            0
          );

          const doctorsList = depts
            .filter((d: any) => d.headDoctorName)
            .map((d: any) => ({
              name: d.headDoctorName,
              department: d.name,
              opdTimings: d.opdTimings || '09:00 AM - 02:00 PM',
              availableTokens: d.availableTokensToday ?? d.available_tokens ?? 25,
            }));

          const allTreatedConditions = Array.from(
            new Set(depts.flatMap((d: any) => d.treatedConditions || []))
          );

          return {
            ...hosp.toObject(),
            distanceKm: distResult.distanceKm,
            estimatedTravelTimeMinutes: distResult.durationMinutes,
            accessibilityFriction,
            departments: depts.map((d: any) => ({
              _id: d._id || d.id,
              name: d.name,
              headDoctorName: d.headDoctorName,
              availableTokensToday: d.availableTokensToday ?? d.available_tokens ?? 25,
              dailyTokenCapacity: d.dailyTokenCapacity ?? d.total_daily_tokens ?? 50,
              opdTimings: d.opdTimings || '09:00 AM - 02:00 PM',
              opdDays: d.opdDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
              consultationFee: d.consultationFee ?? d.fee ?? 0,
              treatedConditions: d.treatedConditions || [],
              description: d.description || '',
              isAcceptingRequests: d.isAcceptingRequests !== false,
            })),
            doctorsList,
            allTreatedConditions,
            totalAvailableTokens,
            totalDailyTokens,
          };
        })
      );

      // Filter by search query if present (across hospital name, city, doctor name, department, diagnosis)
      let list = hospitalsWithDetails;
      if (searchQuery) {
        list = list.filter((h) => {
          const nameMatch = h.name.toLowerCase().includes(searchQuery);
          const cityMatch = h.city.toLowerCase().includes(searchQuery);
          const addressMatch = (h.address || '').toLowerCase().includes(searchQuery);
          const diagMatch = (h.diagnosticFacilities || []).some((f: string) =>
            f.toLowerCase().includes(searchQuery)
          );
          const deptMatch = h.departments.some((d: any) =>
            d.name.toLowerCase().includes(searchQuery)
          );
          const docMatch = h.doctorsList.some((doc: any) =>
            doc.name?.toLowerCase().includes(searchQuery)
          );
          return nameMatch || cityMatch || addressMatch || diagMatch || deptMatch || docMatch;
        });
      }

      // Filter by department if specified
      if (departmentFilter && departmentFilter !== 'All') {
        list = list.filter((h) =>
          h.departments.some(
            (d: any) => d.name.toLowerCase() === departmentFilter.toLowerCase()
          )
        );
      }

      // Filter by radius
      let filtered = list.filter((h) => h.distanceKm <= radiusKm);
      let isAdaptiveProximity = false;

      // Smart Adaptive Fallback: If 0 hospitals within strict radius, return nearest across region
      if (filtered.length === 0 && list.length > 0) {
        filtered = list;
        isAdaptiveProximity = true;
      }

      // Sort by distance ascending
      filtered.sort((a, b) => a.distanceKm - b.distanceKm);

      res.status(200).json({
        success: true,
        count: filtered.length,
        userLocation: { latitude: lat, longitude: lng },
        radiusKm,
        isAdaptiveProximity,
        adaptiveMessage: isAdaptiveProximity
          ? `Showing nearest available health centers relative to your coordinates (${filtered.length} facilities).`
          : undefined,
        hospitals: filtered,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch nearby hospitals.' });
    }
  }

  public static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      let hospital = await Hospital.findById(id);
      if (!hospital) {
        hospital = await Hospital.findOne({});
      }

      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital facility not found.' });
        return;
      }

      let departments = await HospitalDepartment.find({ hospitalId: hospital._id });
      if (!departments || departments.length === 0) {
        departments = await ensureHospitalDepartments(hospital._id);
      }

      let distanceKm = 0;
      let estimatedTravelTimeMinutes = 0;
      if (req.query.lat && req.query.lng) {
        const userLat = parseFloat(req.query.lat as string);
        const userLng = parseFloat(req.query.lng as string);
        const dist = await GoogleMapsService.calculateDistance(
          userLat,
          userLng,
          hospital.latitude,
          hospital.longitude
        );
        distanceKm = dist.distanceKm;
        estimatedTravelTimeMinutes = dist.durationMinutes;
      }

      res.status(200).json({
        success: true,
        hospital,
        departments,
        distanceKm,
        estimatedTravelTimeMinutes,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch hospital details.' });
    }
  }

  public static async search(req: Request, res: Response): Promise<void> {
    try {
      const queryStr = TranslationService.normalizeSearchQuery(
        (req.query.q as string || '').trim().toLowerCase()
      );
      if (!queryStr) {
        res.status(200).json({ success: true, hospitals: [] });
        return;
      }

      const hospitals = await Hospital.find({
        $or: [
          { name: { $regex: queryStr, $options: 'i' } },
          { city: { $regex: queryStr, $options: 'i' } },
          { state: { $regex: queryStr, $options: 'i' } },
          { address: { $regex: queryStr, $options: 'i' } },
          { diagnosticFacilities: { $regex: queryStr, $options: 'i' } },
        ],
      }).limit(20);

      const hospitalsWithDepts = await Promise.all(
        hospitals.map(async (h: any) => {
          const depts = await HospitalDepartment.find({ hospitalId: h._id });
          return {
            ...h.toObject(),
            departments: depts,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: hospitalsWithDepts.length,
        hospitals: hospitalsWithDepts,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Search failed.' });
    }
  }

  public static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let hospital = await Hospital.findOne({ userId: req.user?._id });
      if (!hospital) {
        hospital = await Hospital.findOne({});
      }
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital profile not found.' });
        return;
      }

      const departments = await HospitalDepartment.find({ hospitalId: hospital._id });

      res.status(200).json({
        success: true,
        hospital,
        departments,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to fetch profile.' });
    }
  }

  public static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let hospital = await Hospital.findOne({ userId: req.user?._id });
      if (!hospital) {
        hospital = await Hospital.findOne({});
      }
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital profile not found.' });
        return;
      }

      const {
        name,
        tagline,
        address,
        city,
        state,
        pincode,
        phone,
        emergencyPhone,
        workingHours,
        emergencyAvailable,
        totalBeds,
        availableBeds,
        specialistAvailable,
        diagnosticFacilities,
        languagesSupported,
      } = req.body;

      if (name) hospital.name = name;
      if (tagline !== undefined) hospital.tagline = tagline;
      if (address) hospital.address = address;
      if (city) hospital.city = city;
      if (state) hospital.state = state;
      if (pincode) hospital.pincode = pincode;
      if (phone) hospital.phone = phone;
      if (emergencyPhone !== undefined) hospital.emergencyPhone = emergencyPhone;
      if (workingHours) hospital.workingHours = workingHours;
      if (emergencyAvailable !== undefined) hospital.emergencyAvailable = emergencyAvailable;
      if (totalBeds !== undefined) hospital.totalBeds = totalBeds;
      if (availableBeds !== undefined) hospital.availableBeds = availableBeds;
      if (specialistAvailable !== undefined) hospital.specialistAvailable = specialistAvailable;
      if (diagnosticFacilities) hospital.diagnosticFacilities = diagnosticFacilities;
      if (languagesSupported) hospital.languagesSupported = languagesSupported;

      await hospital.save();

      await AuditService.log('HOSPITAL_PROFILE_UPDATED', 'Hospital', req, {
        userId: req.user?._id,
        resourceId: hospital._id.toString(),
      });

      res.status(200).json({
        success: true,
        message: 'Hospital details updated successfully.',
        hospital,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Update failed.' });
    }
  }

  public static async addDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      let hospital = await Hospital.findOne({ userId: req.user?._id });
      if (!hospital) {
        hospital = await Hospital.findOne({});
      }
      if (!hospital) {
        res.status(404).json({ success: false, message: 'Hospital profile not found.' });
        return;
      }

      const {
        name,
        description,
        headDoctorName,
        opdDays,
        opdTimings,
        dailyTokenCapacity,
        availableTokensToday,
        consultationFee,
        treatedConditions,
      } = req.body;

      if (!name) {
        res.status(400).json({ success: false, message: 'Department name is required.' });
        return;
      }

      const docName = headDoctorName || req.body.head_doctor_name || 'Senior Consultant Specialist';
      const condList = Array.isArray(treatedConditions)
        ? treatedConditions
        : typeof treatedConditions === 'string'
        ? treatedConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['General Outpatient Care', 'Acute Symptom Triage'];

      const department = await HospitalDepartment.create({
        hospitalId: hospital._id || hospital.id,
        name,
        description: description || '',
        headDoctorName: docName,
        head_doctor_name: docName,
        opdDays: Array.isArray(opdDays) ? opdDays : ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opdTimings: opdTimings || '09:00 AM - 02:00 PM',
        dailyTokenCapacity: dailyTokenCapacity !== undefined ? parseInt(dailyTokenCapacity, 10) : 50,
        availableTokensToday: availableTokensToday !== undefined ? parseInt(availableTokensToday, 10) : 25,
        consultationFee: consultationFee !== undefined ? parseFloat(consultationFee) : 0,
        treatedConditions: condList,
        isAcceptingRequests: true,
      });

      await AuditService.log('DEPARTMENT_CREATED', 'HospitalDepartment', req, {
        userId: req.user?._id,
        resourceId: department._id.toString(),
      });

      res.status(201).json({
        success: true,
        message: 'Department and Doctor added successfully.',
        department,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to add department.' });
    }
  }

  public static async updateDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deptId } = req.params;
      const department = await HospitalDepartment.findById(deptId);

      if (!department) {
        res.status(404).json({ success: false, message: 'Department not found.' });
        return;
      }

      const {
        name,
        description,
        headDoctorName,
        opdDays,
        opdTimings,
        dailyTokenCapacity,
        availableTokensToday,
        consultationFee,
        treatedConditions,
      } = req.body;

      if (name) department.name = name;
      if (description !== undefined) department.description = description;
      if (headDoctorName !== undefined) {
        department.headDoctorName = headDoctorName;
        department.head_doctor_name = headDoctorName;
      }
      if (opdDays !== undefined) department.opdDays = opdDays;
      if (opdTimings !== undefined) department.opdTimings = opdTimings;
      if (dailyTokenCapacity !== undefined) department.dailyTokenCapacity = parseInt(dailyTokenCapacity, 10);
      if (availableTokensToday !== undefined) department.availableTokensToday = parseInt(availableTokensToday, 10);
      if (consultationFee !== undefined) department.consultationFee = parseFloat(consultationFee);
      if (treatedConditions !== undefined) {
        department.treatedConditions = Array.isArray(treatedConditions)
          ? treatedConditions
          : typeof treatedConditions === 'string'
          ? treatedConditions.split(',').map((s: string) => s.trim()).filter(Boolean)
          : department.treatedConditions;
      }

      await department.save();

      res.status(200).json({
        success: true,
        message: 'Department and Doctor updated successfully.',
        department,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to update department.' });
    }
  }

  public static async deleteDepartment(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { deptId } = req.params;
      const department = await HospitalDepartment.findByIdAndDelete(deptId);

      if (!department) {
        res.status(404).json({ success: false, message: 'Department not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Department deleted successfully.',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message || 'Failed to delete department.' });
    }
  }
}
