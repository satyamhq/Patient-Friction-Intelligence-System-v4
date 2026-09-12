import React, { useState, useEffect } from 'react';
import { patientService } from '../../services/patientService';
import { useLocation } from '../../context/LocationContext';
import { Patient } from '../../types';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { MapPin, CheckCircle2, User, Save, RefreshCw } from 'lucide-react';

export const PatientProfile: React.FC = () => {
  const { coords, requestCurrentLocation, isLoading: isLocLoading } = useLocation();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // 8 Accessibility Factors
  const [transportAvailability, setTransportAvailability] = useState<any>('low');
  const [digitalAccessLevel, setDigitalAccessLevel] = useState<any>('basic');
  const [familySupport, setFamilySupport] = useState<any>('low');
  const [documentationStatus, setDocumentationStatus] = useState<any>('partial');
  const [financialAccessibility, setFinancialAccessibility] = useState<any>('severely_constrained');
  const [appointmentFlexibility, setAppointmentFlexibility] = useState<any>('inflexible_daily_wage');
  const [residenceType, setResidenceType] = useState<any>('rural_remote');

  // Location
  const [address, setAddress] = useState('UniCenter, LPU Campus');
  const [city, setCity] = useState('Phagwara');
  const [state, setState] = useState('Punjab');
  const [pincode, setPincode] = useState('144411');
  const [latitude, setLatitude] = useState(31.2533);
  const [longitude, setLongitude] = useState(75.7042);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await patientService.getMe();
        if (res.success && res.patient) {
          const p = res.patient;
          setPatient(p);
          setAge(p.age || 45);
          setGender(p.gender || 'female');
          setPreferredLanguage(p.preferredLanguage || 'Hindi');
          setPhone(p.phone || '');
          setEmergencyName(p.emergencyContactName || '');
          setEmergencyPhone(p.emergencyContactPhone || '');

          setTransportAvailability(p.transportAvailability || 'low');
          setDigitalAccessLevel(p.digitalAccessLevel || 'basic');
          setFamilySupport(p.familySupport || 'low');
          setDocumentationStatus(p.documentationStatus || 'partial');
          setFinancialAccessibility(p.financialAccessibility || 'severely_constrained');
          setAppointmentFlexibility(p.appointmentFlexibility || 'inflexible_daily_wage');
          setResidenceType(p.residenceType || 'rural_remote');

          if (p.location) {
            setAddress(p.location.address || coords.address || 'UniCenter, LPU Campus');
            setCity(p.location.city || coords.city || 'Phagwara');
            setState(p.location.state || 'Punjab');
            setPincode(p.location.pincode || coords.pincode || '144411');
            setLatitude(p.location.latitude || coords.latitude || 31.2533);
            setLongitude(p.location.longitude || coords.longitude || 75.7042);
          }
        }
      } catch (e: any) {
        setErrorMessage('Failed to load profile data.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleUseCurrentLocation = async () => {
    const detected = await requestCurrentLocation();
    if (detected) {
      setLatitude(detected.latitude);
      setLongitude(detected.longitude);
      if (detected.address) setAddress(detected.address);
      if (detected.city) setCity(detected.city);
      if (detected.pincode) setPincode(detected.pincode);
    } else if (coords.latitude && coords.longitude) {
      setLatitude(coords.latitude);
      setLongitude(coords.longitude);
      if (coords.address) setAddress(coords.address);
      if (coords.city) setCity(coords.city);
      if (coords.pincode) setPincode(coords.pincode);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const payload: Partial<Patient> = {
        age,
        gender,
        preferredLanguage,
        phone,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone,
        transportAvailability,
        digitalAccessLevel,
        familySupport,
        documentationStatus,
        financialAccessibility,
        appointmentFlexibility,
        residenceType,
        location: {
          address,
          city,
          state,
          pincode,
          latitude,
          longitude,
        },
      };

      const res = await patientService.updateProfile(payload);
      if (res.success) {
        setSuccessMessage(
          `Profile and Friction Metrics updated successfully! Recalculated Accessibility Score: ${res.frictionProfile.overallAccessibilityScore}/100.`
        );
        setPatient(res.patient);
      }
    } catch (e: any) {
      setErrorMessage(e.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Patient Accessibility Profile</h2>
          <p className="text-xs text-slate-500">
            Configure demographic, socio-economic, and geographic parameters to evaluate personal friction
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
          ID: {patient?.patientCode || 'PAT-1048'}
        </span>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && <ErrorAlert message={errorMessage} onDismiss={() => setErrorMessage(null)} />}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Demographics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            1. Personal Demographics & Contact
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10))}
              min={0}
              max={125}
              required
            />

            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              options={[
                { label: 'Female', value: 'female' },
                { label: 'Male', value: 'male' },
                { label: 'Other', value: 'other' },
              ]}
            />

            <Select
              label="Preferred Language / Mother Tongue"
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              options={[
                { label: 'Hindi', value: 'Hindi' },
                { label: 'Santali', value: 'Santali' },
                { label: 'Bengali', value: 'Bengali' },
                { label: 'Mundari', value: 'Mundari' },
                { label: 'Kurukh', value: 'Kurukh' },
                { label: 'English', value: 'English' },
                { label: 'Urdu', value: 'Urdu' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />

            <Input
              label="Emergency Escort Name"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="e.g. Brother / Caregiver"
            />

            <Input
              label="Emergency Escort Phone"
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />
          </div>
        </div>

        {/* Section 2: Non-Clinical Accessibility Factors (Deterministic Inputs) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Non-Clinical Accessibility Determinants
              </h3>
              <p className="text-[11px] text-slate-500">
                These factors directly drive your PFIS Friction Fingerprint and Risk Evaluation
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
              Engine Core
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Transportation Availability"
              value={transportAvailability}
              onChange={(e) => setTransportAvailability(e.target.value)}
              helperText="Determines transit frequency and physical transit barriers"
              options={[
                { label: 'No Vehicle / Irregular Rural Bus (High Friction: 90/100)', value: 'none' },
                { label: 'Shared Auto / Infrequent Bus (Moderate Friction: 75/100)', value: 'low' },
                { label: 'Regular Public Transit / Multi-Hop Route (40/100)', value: 'moderate' },
                { label: 'Dedicated Two-Wheeler / Four-Wheeler (Low Friction: 15/100)', value: 'high' },
              ]}
            />

            <Select
              label="Digital Access & Literacy"
              value={digitalAccessLevel}
              onChange={(e) => setDigitalAccessLevel(e.target.value)}
              helperText="Evaluates capability to handle SMS tokens & portal navigation"
              options={[
                { label: 'Zero Internet / No Smartphone (High Friction: 90/100)', value: 'none' },
                { label: 'Feature Phone / Shared Family Smartphone (65/100)', value: 'basic' },
                { label: 'Smartphone User Needing Minor Form Assistance (30/100)', value: 'moderate' },
                { label: 'High Smartphone & Digital Literacy (Low Friction: 10/100)', value: 'advanced' },
              ]}
            />

            <Select
              label="Family / Caregiver Escort Support"
              value={familySupport}
              onChange={(e) => setFamilySupport(e.target.value)}
              helperText="Availability of family members to navigate hospital registration"
              options={[
                { label: 'Lives Alone / Zero Escort Support (High Friction: 85/100)', value: 'none' },
                { label: 'Caregiver has Conflicting Daily Wage Shifts (65/100)', value: 'low' },
                { label: 'Family Escort Available on Advance Notice (35/100)', value: 'moderate' },
                { label: 'Dedicated Full-Time Family Caregiver (Low Friction: 15/100)', value: 'high' },
              ]}
            />

            <Select
              label="Documentation & Scheme Readiness"
              value={documentationStatus}
              onChange={(e) => setDocumentationStatus(e.target.value)}
              helperText="Status of Ayushman Bharat (PM-JAY) and baseline records"
              options={[
                { label: 'Incomplete / Missing Aadhaar or Scheme Card (85/100)', value: 'incomplete' },
                { label: 'Partial: Has ID but No Formal Referral Slip (50/100)', value: 'partial' },
                { label: 'Complete: PM-JAY & Verified Medical Records Ready (15/100)', value: 'complete' },
              ]}
            />

            <Select
              label="Financial Accessibility & Cost Buffer"
              value={financialAccessibility}
              onChange={(e) => setFinancialAccessibility(e.target.value)}
              helperText="Indirect out-of-pocket travel and medication expenses"
              options={[
                { label: 'Severely Constrained / Daily Wage Dependency (90/100)', value: 'severely_constrained' },
                { label: 'Moderate Budget / Strained by Unplanned Costs (50/100)', value: 'moderate_budget' },
                { label: 'Adequate Savings for Travel & Diagnostics (25/100)', value: 'adequate' },
                { label: 'Comprehensive Cashless Insurance Coverage (10/100)', value: 'insured' },
              ]}
            />

            <Select
              label="Appointment Timing Flexibility"
              value={appointmentFlexibility}
              onChange={(e) => setAppointmentFlexibility(e.target.value)}
              helperText="Impact of morning hospital queues on daily subsistence wages"
              options={[
                { label: 'Inflexible: Morning OPD results in Loss of Daily Wages (85/100)', value: 'inflexible_daily_wage' },
                { label: 'Rigid Shifts: Weekday Morning Visits penalized (60/100)', value: 'rigid_hours' },
                { label: 'Moderate: Can take half-day leave with notice (30/100)', value: 'moderate' },
                { label: 'Flexible / Retired / Self-employed (10/100)', value: 'flexible' },
              ]}
            />
          </div>
        </div>

        {/* Section 3: Geographic Habitation & Coordinates */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">3. Residence Location & Geolocation</h3>
              <p className="text-[11px] text-slate-500">Used for distance matrix and travel fatigue calculation</p>
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocLoading}
              className="px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 rounded-xl text-xs font-bold border border-teal-200 flex items-center gap-1.5 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>{isLocLoading ? 'Detecting...' : 'Use My Live GPS Location'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Habitation / Terrain Type"
              value={residenceType}
              onChange={(e) => setResidenceType(e.target.value)}
              options={[
                { label: 'Rural Remote / Unpaved Road (High Transit Fatigue)', value: 'rural_remote' },
                { label: 'Semi-Urban / Peri-Urban Corridor', value: 'semi_urban' },
                { label: 'Urban Slum / Informal Settlement', value: 'urban_slum' },
                { label: 'Urban Metropolitan Center', value: 'urban_metro' },
              ]}
            />

            <Input
              label="Address / Village"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Input label="City / District" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
            <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
              />
              <Input
                label="Longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
          >
            Save Profile & Recalculate Friction
          </Button>
        </div>
      </form>
    </div>
  );
};
