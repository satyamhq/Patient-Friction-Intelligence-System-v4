import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocation as useLocationCtx } from '../../context/LocationContext';
import { publicHealthService, RoutedFacility } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  MapPin,
  Navigation,
  Car,
  Accessibility,
  Calendar,
  Search,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Phone,
  ExternalLink,
  Clock,
  BadgeCheck,
  Loader2,
  ChevronRight,
  ArrowRight,
  Info,
  RefreshCw,
  Footprints,
  Bus,
  HeartHandshake,
  Stethoscope,
} from 'lucide-react';

// ─── Non-clinical service options ──────────────────────────────────────────
const SERVICE_OPTIONS = [
  { key: 'General healthcare visit',       label: 'General Healthcare Visit',         icon: Stethoscope,    desc: 'Routine check-up or general OPD' },
  { key: 'Specialist appointment',         label: 'Specialist Appointment',           icon: HeartHandshake, desc: 'Appointment with a specialist doctor' },
  { key: 'Diagnostic test',               label: 'Diagnostic / Lab Test',            icon: Search,         desc: 'Blood test, X-ray, ultrasound, etc.' },
  { key: 'Pharmacy medicine service',     label: 'Pharmacy / Medicine Service',       icon: Building2,      desc: 'Collect prescription medicines' },
  { key: 'Follow-up visit',              label: 'Follow-up Visit',                   icon: RefreshCw,      desc: 'Follow-up for an existing condition or treatment' },
  { key: 'Referral service',             label: 'Referral Service',                  icon: ArrowRight,     desc: 'Facility referral for further care' },
  { key: 'Government scheme support',    label: 'Government Scheme / Document Help',  icon: BadgeCheck,     desc: 'PM-JAY, Ayushman Bharat, NHM scheme support' },
  { key: 'Maternal child health',        label: 'Maternal & Child Health Service',    icon: HeartHandshake, desc: 'Antenatal care, delivery, child immunisation' },
  { key: 'Rehabilitation accessibility',  label: 'Rehabilitation / Accessibility Support', icon: Accessibility, desc: 'Physiotherapy, disability support, accessibility services' },
];

const TRAVEL_OPTIONS = [
  { key: 'Walking',                       label: 'Walking',            icon: Footprints },
  { key: 'Public transport',              label: 'Public Transport',   icon: Bus },
  { key: 'Private vehicle',              label: 'Private Vehicle',    icon: Car },
  { key: 'Ambulance emergency transport', label: 'Ambulance / Emergency Transport', icon: Navigation },
  { key: 'Family friend transport',       label: 'Family / Friend Transport', icon: Car },
];

const ACCESSIBILITY_OPTIONS = [
  'Wheelchair access',
  'Ramp / Level entry',
  'Accessible entrance',
  'Accessible toilet',
  'Assistance at registration',
  'Signage / Wayfinding support',
];

const APPOINTMENT_OPTIONS = [
  'Has appointment',
  'Has referral',
  'No appointment (walk-in)',
  'Not sure',
];

// ─── Emergency safety keywords (non-diagnostic — only triggers safety banner) ─
const EMERGENCY_KEYWORDS = [
  'emergency', 'unconscious', 'not breathing', 'severe bleeding', 'heart attack',
  'stroke', 'snake bite', 'poisoning', 'accident', 'trauma', 'sos',
];

export const DigitalTriagePage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { coords, requestCurrentLocation, isLoading: isLocLoading } = useLocationCtx();

  // ── Form state ─────────────────────────────────────────────────────────────
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [serviceNeeded, setServiceNeeded] = useState('');
  const [serviceNote, setServiceNote] = useState('');
  const [locationMode, setLocationMode] = useState<'gps' | 'manual'>('manual');
  const [locationName, setLocationName] = useState('');
  const [locationLat, setLocationLat] = useState<number | undefined>(undefined);
  const [locationLng, setLocationLng] = useState<number | undefined>(undefined);
  const [travelMode, setTravelMode] = useState('Public transport');
  const [accessibilityNeeds, setAccessibilityNeeds] = useState<string[]>([]);
  const [appointmentStatus, setAppointmentStatus] = useState('No appointment (walk-in)');
  const [showEmergencyBanner, setShowEmergencyBanner] = useState(false);

  // ── Results state ──────────────────────────────────────────────────────────
  const [isSearching, setIsSearching] = useState(false);
  const [routedFacilities, setRoutedFacilities] = useState<RoutedFacility[]>([]);
  const [routingFactors, setRoutingFactors] = useState<string[]>([]);
  const [requestId, setRequestId] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [routingError, setRoutingError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // ── Use GPS coordinates if available ──────────────────────────────────────
  useEffect(() => {
    if (locationMode === 'gps' && coords.latitude && coords.longitude) {
      setLocationLat(coords.latitude);
      setLocationLng(coords.longitude);
      setLocationName(`${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)}`);
    }
  }, [locationMode, coords.latitude, coords.longitude]);

  // ── Emergency keyword detection ────────────────────────────────────────────
  useEffect(() => {
    const text = (serviceNote + ' ' + serviceNeeded).toLowerCase();
    setShowEmergencyBanner(EMERGENCY_KEYWORDS.some(kw => text.includes(kw)));
  }, [serviceNote, serviceNeeded]);

  const toggleAccessibility = (val: string) => {
    setAccessibilityNeeds(prev =>
      prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]
    );
  };

  const handleUseGPS = () => {
    setLocationMode('gps');
    requestCurrentLocation();
  };

  const handleSubmit = async () => {
    if (!serviceNeeded) {
      showToast('Please select the healthcare service you need.', 'error');
      setStep(1);
      return;
    }

    setIsSearching(true);
    setHasSearched(false);
    setRoutingError(null);
    setRoutedFacilities([]);

    try {
      const result = await publicHealthService.runAccessRoute({
        serviceNeeded,
        serviceNote: serviceNote.trim() || undefined,
        locationName: locationName.trim() || undefined,
        locationLat,
        locationLng,
        travelMode,
        accessibilityNeeds: accessibilityNeeds.length > 0 ? accessibilityNeeds : [],
        appointmentStatus,
      });

      if (result.success) {
        setRoutedFacilities(result.routedFacilities || []);
        setRoutingFactors(result.routingFactors || []);
        setRequestId(result.requestId || '');
        setHasSearched(true);
        if ((result.routedFacilities || []).length === 0) {
          showToast('No verified facilities matched your requirements. Try adjusting your selection.', 'info');
        } else {
          showToast(`Found ${result.routedFacilities.length} verified facilities matching your access needs.`, 'success');
          setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      } else {
        setRoutingError(result.message || 'Facility routing is currently unavailable. Please try again.');
        setHasSearched(true);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Network error. Please check your connection and try again.';
      setRoutingError(msg);
      setHasSearched(true);
      showToast(msg, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const facilityId = (f: RoutedFacility['facility']) => f.id || f._id || '';

  const getMapsLink = (f: RoutedFacility['facility']) => {
    if (f.latitude && f.longitude) {
      return `https://www.google.com/maps/dir/?api=1&destination=${f.latitude},${f.longitude}`;
    }
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(f.name + ' ' + f.city)}`;
  };

  const stepsCompleted = (): boolean => !!serviceNeeded;

  const STEP_LABELS = ['Service', 'Location', 'Travel', 'Accessibility', 'Appointment'];

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-700 via-cyan-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold uppercase tracking-wider">
            <Navigation className="w-3.5 h-3.5" />
            <span>Healthcare Access &amp; Facility Router</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Find the Right Healthcare Facility
          </h1>
          <p className="text-teal-100/90 text-sm sm:text-base max-w-3xl leading-relaxed">
            Find the right healthcare facility based on the service you need, your location, travel preferences,
            and accessibility requirements. This is not a medical diagnosis tool.
          </p>
        </div>
      </div>

      {/* ── Emergency Safety Banner ────────────────────────────────────── */}
      {showEmergencyBanner && (
        <div className="flex items-start gap-4 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border-2 border-rose-300 dark:border-rose-700 shadow-sm">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-800 dark:text-rose-300">
              If you may be experiencing a medical emergency, seek immediate emergency medical care.
            </p>
            <p className="text-xs text-rose-700 dark:text-rose-400 mt-1">
              Call <strong>108</strong> (India Emergency Ambulance) or go to your nearest Emergency Department immediately.
              This tool cannot assess medical emergencies.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* ── Left: Step-by-step form ────────────────────────────────────── */}
        <div className="lg:col-span-7 space-y-5">

          {/* Step Progress Bar */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEP_LABELS.map((label, i) => {
              const n = (i + 1) as 1 | 2 | 3 | 4 | 5;
              const active = step === n;
              const done = step > n;
              return (
                <React.Fragment key={label}>
                  <button
                    onClick={() => setStep(n)}
                    aria-label={`Go to step ${n}: ${label}`}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                      active
                        ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                        : done
                        ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{n}</span>}
                    {label}
                  </button>
                  {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                </React.Fragment>
              );
            })}
          </div>

          {/* ── STEP 1: What service do you need? ──────────────────────── */}
          {step === 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-teal-600" />
                  What Healthcare Service Do You Need?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Select the type of service. We will find verified facilities that offer it.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Healthcare service selection">
                {SERVICE_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const selected = serviceNeeded === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setServiceNeeded(opt.key)}
                      className={`text-left p-3 rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                        selected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${selected ? 'text-teal-600' : 'text-slate-400'}`} />
                        <div>
                          <p className={`text-xs font-bold ${selected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-700 dark:text-slate-200'}`}>
                            {opt.label}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {serviceNeeded && (
                <div>
                  <label htmlFor="service-note" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Optional: Any additional access or travel details?
                  </label>
                  <textarea
                    id="service-note"
                    rows={2}
                    value={serviceNote}
                    onChange={e => setServiceNote(e.target.value)}
                    placeholder="e.g., I need a facility that is accessible by bus and open on weekends..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all resize-none"
                  />
                </div>
              )}

              <button
                type="button"
                disabled={!serviceNeeded}
                onClick={() => setStep(2)}
                className="w-full py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm shadow flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Next: Your Location
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Location ──────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  Your Location
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This helps us calculate distance to nearby verified facilities. You can skip this step.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleUseGPS}
                  disabled={isLocLoading}
                  className="flex-1 py-2.5 px-4 rounded-xl border-2 border-teal-400 dark:border-teal-600 bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 text-xs font-bold flex items-center justify-center gap-2 hover:bg-teal-100 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLocLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</>
                    : <><Navigation className="w-4 h-4" /> Use My Current Location</>
                  }
                </button>
              </div>

              <div>
                <label htmlFor="location-manual" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Or enter your area / city / pincode
                </label>
                <input
                  id="location-manual"
                  type="text"
                  value={locationMode === 'manual' ? locationName : ''}
                  onChange={e => { setLocationMode('manual'); setLocationName(e.target.value); setLocationLat(undefined); setLocationLng(undefined); }}
                  placeholder="e.g., Phagwara, Punjab or 144401"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all"
                />
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  Distance calculations are only available when GPS location is used. Manual entry is used for reference only.
                </p>
              </div>

              {locationMode === 'gps' && coords.latitude && (
                <div className="flex items-center gap-2 text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-3 py-2 rounded-lg border border-teal-200 dark:border-teal-800">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  GPS location detected: {coords.latitude.toFixed(4)}, {coords.longitude.toFixed(4)}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  Next: Travel Mode <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Travel Mode ───────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Car className="w-4 h-4 text-teal-600" />
                  How Will You Travel?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your travel preference helps us suggest accessible, well-connected facilities.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Travel mode selection">
                {TRAVEL_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const selected = travelMode === opt.key;
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setTravelMode(opt.key)}
                      className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                        selected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40'
                          : 'border-slate-200 dark:border-slate-700 hover:border-teal-300 bg-slate-50 dark:bg-slate-800/50'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mx-auto mb-1.5 ${selected ? 'text-teal-600' : 'text-slate-400'}`} />
                      <p className={`text-[11px] font-bold leading-tight ${selected ? 'text-teal-700 dark:text-teal-300' : 'text-slate-600 dark:text-slate-300'}`}>
                        {opt.label}
                      </p>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep(4)} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  Next: Accessibility <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Accessibility ─────────────────────────────────── */}
          {step === 4 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Accessibility className="w-4 h-4 text-teal-600" />
                  Accessibility Requirements
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Optional. Select any accessibility features the facility must have for your visit.
                </p>
              </div>

              <div className="flex flex-wrap gap-2" role="group" aria-label="Accessibility needs">
                {ACCESSIBILITY_OPTIONS.map(opt => {
                  const isChecked = accessibilityNeeds.includes(opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleAccessibility(opt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                        isChecked
                          ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                      }`}
                    >
                      {isChecked && '✓ '}{opt}
                    </button>
                  );
                })}
              </div>

              {accessibilityNeeds.length > 0 && (
                <div className="text-xs text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-3 py-2 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 shrink-0" />
                  We will only show facilities that are likely to support your accessibility needs. Availability is based on the verified facility information in our database.
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  ← Back
                </button>
                <button type="button" onClick={() => setStep(5)} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                  Next: Appointment <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Appointment Status ────────────────────────────── */}
          {step === 5 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal-600" />
                  Do You Have an Appointment or Referral?
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  This helps us suggest facilities that match your access situation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Appointment status selection">
                {APPOINTMENT_OPTIONS.map(opt => {
                  const selected = appointmentStatus === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setAppointmentStatus(opt)}
                      className={`p-3 rounded-xl border-2 text-xs font-semibold text-left transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 ${
                        selected
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 hover:border-teal-300'
                      }`}
                    >
                      {selected && <CheckCircle2 className="w-3.5 h-3.5 inline mr-1 text-teal-600" />}
                      {opt}
                    </button>
                  );
                })}
              </div>

              {/* Summary before search */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Your Search Summary</h3>
                <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                    <span>Service: <strong className="text-slate-800 dark:text-slate-200">{serviceNeeded || '—'}</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Location: <strong className="text-slate-800 dark:text-slate-200">{locationName || 'Not specified'}</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Travel: <strong className="text-slate-800 dark:text-slate-200">{travelMode}</strong></span>
                  </li>
                  {accessibilityNeeds.length > 0 && (
                    <li className="flex items-center gap-2">
                      <Accessibility className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>Accessibility: <strong className="text-slate-800 dark:text-slate-200">{accessibilityNeeds.join(', ')}</strong></span>
                    </li>
                  )}
                  <li className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Appointment: <strong className="text-slate-800 dark:text-slate-200">{appointmentStatus}</strong></span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setStep(4)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer">
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!stepsCompleted() || isSearching}
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow cursor-pointer"
                >
                  {isSearching
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Finding Facilities...</>
                    : <><Search className="w-4 h-4" /> Find Verified Facilities</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Info Panel / Results ──────────────────────────────── */}
        <div className="lg:col-span-5 space-y-5">

          {/* How It Works (shown before search) */}
          {!hasSearched && !isSearching && (
            <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 mx-auto">
                <Navigation className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">How This Works</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Tell us what service you need and your location. We search our verified facility database
                  and rank results by distance, service match, and accessibility — so you reach the right facility with less travel burden.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                {[
                  { dot: 'bg-teal-500', text: 'Service matching — facilities that offer what you need' },
                  { dot: 'bg-blue-500', text: 'Distance sorting — closer facilities ranked first' },
                  { dot: 'bg-amber-500', text: 'Accessibility filtering — meets your access requirements' },
                  { dot: 'bg-slate-400', text: 'Real data only — no fake or invented facility information' },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className={`w-2 h-2 rounded-full ${item.dot} shrink-0 mt-1`} />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {isSearching && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-3 shadow-sm">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Searching verified facilities...</p>
              <p className="text-xs text-slate-500">Matching service, location, and accessibility requirements from the backend database.</p>
            </div>
          )}

          {/* Error state */}
          {hasSearched && routingError && !isSearching && (
            <div className="bg-rose-50 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-800 p-5 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                Facility search unavailable
              </div>
              <p className="text-xs text-rose-600 dark:text-rose-400">{routingError}</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="text-xs font-semibold text-rose-700 dark:text-rose-300 underline cursor-pointer hover:no-underline"
              >
                Try again
              </button>
            </div>
          )}

          {/* No results state */}
          {hasSearched && !routingError && !isSearching && routedFacilities.length === 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-700 p-5 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-sm">
                <Info className="w-4 h-4" />
                No verified facilities found
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400">
                No verified facility matching your access requirements is currently available.
                Try adjusting your service selection or accessibility requirements.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Results Section (full width) ─────────────────────────────────── */}
      {hasSearched && routedFacilities.length > 0 && !isSearching && (
        <div ref={resultsRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Verified Facilities — {routedFacilities.length} Result{routedFacilities.length !== 1 ? 's' : ''}
              </h2>
              {requestId && (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Request ID: {requestId}</p>
              )}
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-700 hover:bg-teal-100 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>

          {/* Routing factors used */}
          {routingFactors.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
              {routingFactors.map((factor, i) => (
                <span key={i} className="text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {factor}
                </span>
              ))}
            </div>
          )}

          {/* Facility result cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {routedFacilities.map((item, idx) => {
              const fac = item.facility;
              const fid = facilityId(fac);
              const isFirst = idx === 0;
              return (
                <div
                  key={fid || idx}
                  className={`bg-white dark:bg-slate-900 rounded-2xl border-2 p-5 shadow-sm hover:shadow-md transition-all space-y-4 ${
                    isFirst ? 'border-teal-400 dark:border-teal-600' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isFirst ? 'bg-teal-100 dark:bg-teal-950/60' : 'bg-slate-100 dark:bg-slate-800'}`}>
                      <Building2 className={`w-5 h-5 ${isFirst ? 'text-teal-600' : 'text-slate-500'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {isFirst && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-full border border-teal-200 dark:border-teal-800 mb-1 inline-block">
                              Best Match
                            </span>
                          )}
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {fac.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {[fac.address, fac.city, fac.state, fac.pincode].filter(Boolean).join(', ')}
                          </p>
                        </div>
                        {fac.isVerified && (
                          <BadgeCheck className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" aria-label="Verified facility" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Distance & Type Tags */}
                  <div className="flex flex-wrap gap-2">
                    <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {fac.type}
                    </span>
                    {item.distanceKm !== null ? (
                      <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {item.distanceKm} km away
                      </span>
                    ) : (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 italic">
                        Distance unavailable
                      </span>
                    )}
                    {fac.workingHours && (
                      <span className="text-[11px] px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {fac.workingHours}
                      </span>
                    )}
                  </div>

                  {/* Why this facility */}
                  {item.routingReasons.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Why this facility?</p>
                      <ul className="space-y-1">
                        {item.routingReasons.map((reason, ri) => (
                          <li key={ri} className="text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-teal-500 shrink-0 mt-0.5" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Accessibility matches */}
                  {item.accessibilityMatches.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {item.accessibilityMatches.map((match, ai) => (
                        <span key={ai} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                          <Accessibility className="w-2.5 h-2.5" /> {match}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Last updated */}
                  {fac.updatedAt && (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last updated: {new Date(fac.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-1">
                    {fid ? (
                      <Link
                        to={`/patient/hospitals/${fid}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
                      >
                        <Building2 className="w-3.5 h-3.5" /> View Facility
                      </Link>
                    ) : (
                      <span className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-semibold text-center">
                        Details unavailable
                      </span>
                    )}
                    <a
                      href={getMapsLink(fac)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700 transition-all"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Get Directions
                    </a>
                  </div>
                  {fac.phone && (
                    <a
                      href={`tel:${fac.phone}`}
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <Phone className="w-3.5 h-3.5" /> Contact: {fac.phone}
                    </a>
                  )}
                  {fac.website && (
                    <a
                      href={fac.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Visit Website
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
