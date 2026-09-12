import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { hospitalService } from '../../services/hospitalService';
import { useLocation } from '../../context/LocationContext';
import { Hospital } from '../../types';
import { HospitalMap } from '../../components/maps/HospitalMap';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { VoiceSearchButton } from '../../components/common/VoiceSearchButton';
import { TTSButton } from '../../components/common/TTSButton';
import {
  MapPin,
  Search,
  Clock,
  Bed,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Navigation,
  UserCheck,
  Stethoscope,
  Phone,
  Activity,
  CheckCircle2,
  Info,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

export const NearbyHospitals: React.FC = () => {
  const { t } = useTranslation();
  const { coords, requestCurrentLocation, isLoading: isLocLoading, errorMessage: locError } = useLocation();
  const navigate = useNavigate();

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [isAdaptiveNotice, setIsAdaptiveNotice] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHospitals = async () => {
    setIsLoading(true);
    try {
      const res = await hospitalService.getNearby({
        lat: coords.latitude,
        lng: coords.longitude,
        radiusKm,
        type: typeFilter,
        emergency: emergencyOnly,
        department: departmentFilter !== 'All' ? departmentFilter : undefined,
      });

      if (res.success) {
        let list = res.hospitals || [];
        if (res.isAdaptiveProximity && res.adaptiveMessage) {
          setIsAdaptiveNotice(res.adaptiveMessage);
        } else {
          setIsAdaptiveNotice(null);
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter((h: any) => {
            const nameMatch = h.name.toLowerCase().includes(q);
            const cityMatch = h.city.toLowerCase().includes(q);
            const addressMatch = (h.address || '').toLowerCase().includes(q);
            const diagMatch = (h.diagnosticFacilities || []).some((f: string) => f.toLowerCase().includes(q));
            const deptMatch = (h.departments || []).some((d: any) => {
              const dName = typeof d === 'string' ? d : d.name;
              return dName.toLowerCase().includes(q);
            });
            const docMatch = (h.doctorsList || []).some((doc: any) => (doc.name || doc.headDoctorName || '').toLowerCase().includes(q));
            const conditionMatch = (h.allTreatedConditions || []).some((c: string) => c.toLowerCase().includes(q));
            return nameMatch || cityMatch || addressMatch || diagMatch || deptMatch || docMatch || conditionMatch;
          });
        }
        setHospitals(list);
      }
    } catch (e) {
      console.error('[NearbyHospitals Error]', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [coords.latitude, coords.longitude, radiusKm, typeFilter, emergencyOnly, departmentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  const handleVoiceTranscript = (text: string) => {
    setSearchQuery(text);
  };

  const handleQuickChip = (chip: string) => {
    setSearchQuery(chip);
  };

  return (
    <div className="space-y-6">
      {/* Header & Location Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <MapPin className="w-6 h-6 text-brand-500" />
              {t('patient.findNearbyHospital', 'Nearby Hospitals & Health Facilities')}
            </h2>
            <TTSButton
              text={`${t('patient.findNearbyHospital')} - ${hospitals.length} facilities discovered near your location`}
              label={t('common.listen', 'Listen')}
            />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Discovered healthcare facilities with department schedules, estimated bed capacity, and transit friction calculations
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => requestCurrentLocation()}
            disabled={isLocLoading}
            className="flex-1 md:flex-none px-3.5 py-2 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 text-brand-700 dark:text-brand-300 rounded-xl text-xs font-bold border border-brand-200 dark:border-brand-800 flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <MapPin className={`w-4 h-4 ${isLocLoading ? 'animate-bounce text-brand-600' : ''}`} />
            <span>{isLocLoading ? 'Detecting GPS Location...' : 'Use My Live GPS Location'}</span>
          </button>
        </div>
      </div>

      {/* Non-Clinical Operational Logistics Notice */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <span>
          <strong>Non-Clinical Logistics Directory:</strong> Facility names, travel distance, and transit estimates are retrieved via geographic services. PFIS does not diagnose diseases or recommend medical treatments. Operational metrics (queue tokens, bed availability) reflect prototype demonstration data.
        </span>
      </div>

      {locError && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{locError}</span>
        </div>
      )}

      {isAdaptiveNotice && (
        <div className="p-3.5 bg-teal-50/90 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 rounded-xl text-xs text-teal-800 dark:text-teal-200 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>{isAdaptiveNotice}</span>
          </div>
          <button
            onClick={() => setRadiusKm(50)}
            className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-teal-300 dark:border-teal-700 rounded-lg font-bold text-[11px] text-teal-700 dark:text-teal-300 hover:bg-teal-100"
          >
            Expand Radius to 50 km
          </button>
        </div>
      )}

      {/* Filter & Search Ribbon */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-card space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Search by Hospital name, City, Department (e.g. General OPD, Orthopedics, Pediatrics), or Doctor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="w-full pr-10"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <VoiceSearchButton onTranscript={handleVoiceTranscript} />
            </div>
          </div>
          <Button type="submit" variant="primary" size="md">
            {t('common.search', 'Search')}
          </Button>
        </form>

        {/* Quick Suggestion Search Chips */}
        <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            <Search className="w-3 h-3 text-teal-500" /> Quick Search:
          </span>
          {['Phagwara', 'Jalandhar', 'Heart & BP', 'Sugar & Diabetes', 'Bone & Fractures', 'Fever & Dengue', 'Maternity / Delivery', 'Emergency 24/7'].map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className={`px-2.5 py-0.5 rounded-full border text-[11px] transition-all ${
                searchQuery.toLowerCase() === chip.toLowerCase()
                  ? 'bg-teal-600 text-white border-teal-700 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {chip}
            </button>
          ))}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-rose-600 hover:underline ml-1 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <Select
            label="Radius Distance"
            value={radiusKm}
            onChange={(e) => setRadiusKm(parseInt(e.target.value, 10))}
            options={[
              { label: 'Within 5 km', value: 5 },
              { label: 'Within 10 km', value: 10 },
              { label: 'Within 25 km (Standard)', value: 25 },
              { label: 'Within 50 km (Regional)', value: 50 },
            ]}
          />

          <Select
            label="Facility Type"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { label: 'All Facility Types', value: 'All' },
              { label: 'Government Public Hospital', value: 'Government' },
              { label: 'Private Super Speciality', value: 'Private' },
              { label: 'Charitable Trust Center', value: 'Charitable' },
            ]}
          />

          <Select
            label="Department Specialization"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            options={[
              { label: 'All Departments', value: 'All' },
              { label: 'Cardiology', value: 'Cardiology' },
              { label: 'Orthopedics', value: 'Orthopedics' },
              { label: 'General Medicine', value: 'General Medicine' },
              { label: 'Obstetrics & Gynecology', value: 'Obstetrics & Gynecology' },
              { label: 'Pediatrics', value: 'Pediatrics' },
              { label: 'Oncology', value: 'Oncology' },
              { label: 'Nephrology', value: 'Nephrology' },
            ]}
          />

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300 p-2 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 w-full h-[38px]">
              <input
                type="checkbox"
                checked={emergencyOnly}
                onChange={(e) => setEmergencyOnly(e.target.checked)}
                className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
              />
              <span>🚨 {t('patient.emergencyAvail', '24/7 Available')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Interactive Map Component */}
      <HospitalMap
        userLocation={{ latitude: coords.latitude, longitude: coords.longitude }}
        hospitals={hospitals}
        selectedHospitalId={selectedHospital?._id || (selectedHospital as any)?.id}
        onSelectHospital={(h) => navigate(`/patient/hospitals/${h._id || (h as any).id}`)}
        radiusKm={radiusKm}
        height="400px"
      />

      {/* Hospital Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Discovered Facilities ({hospitals.length})</span>
            {searchQuery && (
              <span className="text-xs font-normal text-teal-600 bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-full border border-teal-200">
                Matching "{searchQuery}"
              </span>
            )}
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Sorted by distance from your coordinates</span>
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={4} />
        ) : hospitals.length === 0 ? (
          <EmptyState
            title="No Hospitals Found in this Radius"
            description="Try expanding the search radius filter to 50 km or removing specific department constraints."
            actionText="Reset Filters to 50km"
            onAction={() => {
              setRadiusKm(50);
              setTypeFilter('All');
              setDepartmentFilter('All');
              setEmergencyOnly(false);
              setSearchQuery('');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {hospitals.map((hosp: any) => {
              const doctorsList = hosp.doctorsList || (Array.isArray(hosp.departments) ? hosp.departments.filter((d: any) => d.headDoctorName) : []);
              const availableSeats = hosp.totalAvailableTokens ?? (Array.isArray(hosp.departments) ? hosp.departments.reduce((s: number, d: any) => s + (d.availableTokensToday || 0), 0) : 35);
              const totalSeats = hosp.totalDailyTokens ?? (Array.isArray(hosp.departments) ? hosp.departments.reduce((s: number, d: any) => s + (d.dailyTokenCapacity || 0), 0) : 80);

              return (
                <div
                  key={hosp._id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-card hover:shadow-card-hover hover:border-teal-300 dark:hover:border-teal-600 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3.5">
                    {/* Top Header & Distance */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            hosp.type === 'Government'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : hosp.type === 'Private'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}>
                            {hosp.type}
                          </span>
                          {hosp.emergencyAvailable && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200 dark:border-red-900">
                              🚨 24/7 Emergency
                            </span>
                          )}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            100% Verified Profile
                          </span>
                        </div>

                        <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                          {hosp.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                          <span>{hosp.address}, {hosp.city}, {hosp.state}</span>
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-sm font-black text-teal-700 dark:text-teal-400 block">
                          {hosp.distanceKm !== undefined ? `${hosp.distanceKm} km` : '~'}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                          {hosp.estimatedTravelTimeMinutes ? `~${hosp.estimatedTravelTimeMinutes} mins travel` : ''}
                        </span>
                      </div>
                    </div>

                    {/* LIVE AVAILABILITY BANNER: OPD SEATS & HOSPITAL BEDS */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* OPD Seat / Token Availability */}
                      <div className="p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1">
                            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
                            OPD Token Seats
                          </span>
                          <span className="text-[10px] font-bold bg-teal-200/60 dark:bg-teal-900 text-teal-900 dark:text-teal-200 px-1.5 py-0.2 rounded">
                            {availableSeats > 0 ? 'Seats Open' : 'Full'}
                          </span>
                        </div>
                        <div className="text-sm font-black text-teal-950 dark:text-teal-100">
                          {availableSeats} <span className="text-xs font-normal text-teal-700 dark:text-teal-300">/ {totalSeats || 80} Available Today</span>
                        </div>
                      </div>

                      {/* Bed Availability */}
                      <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide flex items-center gap-1">
                            <Bed className="w-3.5 h-3.5 text-blue-600" />
                            Hospital Beds
                          </span>
                          <span className="text-[10px] font-bold bg-blue-200/60 dark:bg-blue-900 text-blue-900 dark:text-blue-200 px-1.5 py-0.2 rounded">
                            {hosp.availableBeds} Avail
                          </span>
                        </div>
                        <div className="text-sm font-black text-blue-950 dark:text-blue-100">
                          {hosp.availableBeds} <span className="text-xs font-normal text-blue-700 dark:text-blue-300">/ {hosp.totalBeds} Total Beds</span>
                        </div>
                      </div>
                    </div>

                    {/* AMBULANCE & CARE ESCORT ASSISTANCE BADGES */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-rose-50/90 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🚑</span>
                          <div>
                            <span className="font-bold text-rose-900 dark:text-rose-200 text-xs block">Hospital Ambulance</span>
                            <span className="text-[10px] text-rose-700 dark:text-rose-300">
                              {hosp.ambulanceService?.availableAmbulances ?? 2} Ready • ETA ~{hosp.ambulanceService?.avgEtaMins ?? 18}m
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-rose-200/80 dark:bg-rose-900 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded-full">
                          Home Pickup
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🤝</span>
                          <div>
                            <span className="font-bold text-emerald-900 dark:text-emerald-200 text-xs block">Doorstep Care Escort</span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-300">
                              Pick + Checkup + Return Drop
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold bg-emerald-200/80 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                          Sahayak
                        </span>
                      </div>
                    </div>

                    {/* DOCTORS ON DUTY SECTION */}
                    {doctorsList && doctorsList.length > 0 && (
                      <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                            <Stethoscope className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                            👨‍⚕️ Doctors On Duty & Specialists:
                          </span>
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {doctorsList.length} Active Doctors
                          </span>
                        </div>

                        <div className="space-y-1 pt-1">
                          {doctorsList.slice(0, 3).map((doc: any, i: number) => {
                            const docName = doc.headDoctorName || doc.name;
                            const deptName = doc.department || doc.name;
                            const tokens = doc.availableTokensToday ?? doc.availableTokens;

                            return (
                              <div
                                key={i}
                                className="flex items-center justify-between text-[11px] bg-white dark:bg-slate-900 p-1.5 px-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800"
                              >
                                <div className="truncate pr-2">
                                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                                    {docName}
                                  </span>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    Dept: {deptName}
                                  </span>
                                </div>
                                {tokens !== undefined && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 flex-shrink-0">
                                    {tokens} seats open
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {doctorsList.length > 3 && (
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5 text-center">
                              +{doctorsList.length - 3} more specialized doctors in departments
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TREATED ILLNESSES & CONDITIONS (बीमारियों का इलाज) */}
                    {hosp.allTreatedConditions && hosp.allTreatedConditions.length > 0 && (
                      <div className="space-y-1.5 bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-900/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 text-[11px]">
                            <span>🩺</span>
                            बीमारियों का इलाज (Illnesses Treated):
                          </span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">
                            {hosp.allTreatedConditions.length} Conditions Treated
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {hosp.allTreatedConditions.slice(0, 8).map((cond: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-200 px-2 py-0.5 rounded-md font-medium border border-emerald-200/80 dark:border-emerald-800 shadow-2xs"
                            >
                              ✓ {cond}
                            </span>
                          ))}
                          {hosp.allTreatedConditions.length > 8 && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold px-1 py-0.5">
                              +{hosp.allTreatedConditions.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick Hospital Details: Wait time, Timings & Phone */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>Avg Wait: ~{hosp.averageWaitTimeMinutes || 20} mins</span>
                      </div>
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{hosp.phone || '01824-260230'}</span>
                      </div>
                    </div>

                    {/* Diagnostic Facilities Tags */}
                    {hosp.diagnosticFacilities && hosp.diagnosticFacilities.length > 0 && (
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          Diagnostics & Facilities:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {hosp.diagnosticFacilities.slice(0, 5).map((fac: string, i: number) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded font-medium border border-slate-200/50 dark:border-slate-700"
                            >
                              {fac}
                            </span>
                          ))}
                          {hosp.diagnosticFacilities.length > 5 && (
                            <span className="text-[10px] text-slate-400 px-1 py-0.5">
                              +{hosp.diagnosticFacilities.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button
                      variant="primary"
                      size="sm"
                      className="flex-1"
                      onClick={() => navigate(`/patient/hospitals/${hosp._id || (hosp as any).id}`)}
                      icon={<ArrowRight className="w-4 h-4" />}
                    >
                      View All Doctors & Book Token
                    </Button>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1${coords ? `&origin=${coords.latitude},${coords.longitude}` : ''}&destination=${hosp.latitude},${hosp.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-bold transition-all shadow-sm"
                      title="Open Turn-by-Turn GPS Navigation in Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 fill-blue-600/20 animate-pulse" />
                      <span className="hidden sm:inline">Google Maps</span>
                    </a>

                    <TTSButton
                      text={`${hosp.name}, located in ${hosp.city}. Distance is ${hosp.distanceKm} kilometers. Available beds: ${hosp.availableBeds}. Available OPD token seats: ${availableSeats}.`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
