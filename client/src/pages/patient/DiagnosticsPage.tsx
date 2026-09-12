import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { publicHealthService, DiagnosticService, DiagnosticBooking } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  FileCheck,
  Search,
  XCircle,
  HelpCircle,
  Wrench,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Info,
  X,
  Loader2,
  Send,
} from 'lucide-react';

// ===================== HELPERS =====================

/** Formats time string like '08:00' to '08:00 AM' */
function formatTime(t: string | null | undefined): string | null {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h)) return t;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m || 0).padStart(2, '0')} ${ampm}`;
}

/** Build operational hours display string from opening/closing times */
function getOperationalHours(s: DiagnosticService): string {
  const open = formatTime(s.opening_time);
  const close = formatTime(s.closing_time);
  if (open && close) return `${open} – ${close}`;
  if (open) return `Opens ${open}`;
  if (close) return `Closes ${close}`;
  return 'Service hours unavailable';
}

/** Display fee truthfully */
function getFeeDisplay(s: DiagnosticService): { label: string; className: string } {
  if (s.fee === null || s.fee === undefined) {
    return { label: 'Fee information unavailable', className: 'text-slate-400' };
  }
  if (s.fee === 0) {
    if (s.fee_verified) {
      return { label: 'FREE (Govt.)', className: 'text-emerald-600 font-extrabold' };
    }
    return { label: 'FREE (Unverified)', className: 'text-amber-600 font-bold' };
  }
  const currency = s.currency || 'INR';
  const symbol = currency === 'INR' ? '₹' : currency;
  if (s.fee_verified) {
    return { label: `${symbol}${s.fee}`, className: 'text-emerald-600 font-extrabold' };
  }
  return { label: `${symbol}${s.fee} (Unverified)`, className: 'text-amber-600 font-bold' };
}

/** Equipment status badge config */
function getEquipmentBadge(status: string): { label: string; icon: React.ReactNode; className: string } {
  switch (status) {
    case 'FUNCTIONAL':
      return {
        label: 'Equipment Functional',
        icon: <CheckCircle2 className="w-3 h-3" />,
        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      };
    case 'UNDER_MAINTENANCE':
      return {
        label: 'Under Maintenance',
        icon: <Wrench className="w-3 h-3" />,
        className: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      };
    case 'OUT_OF_SERVICE':
      return {
        label: 'Currently unavailable',
        icon: <XCircle className="w-3 h-3" />,
        className: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
      };
    default:
      return {
        label: 'Equipment status unavailable',
        icon: <HelpCircle className="w-3 h-3" />,
        className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
      };
  }
}

/** Verification status badge config */
function getVerificationBadge(status: string): { label: string; icon: React.ReactNode; className: string } {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'Verified',
        icon: <ShieldCheck className="w-3 h-3" />,
        className: 'text-emerald-700 dark:text-emerald-400',
      };
    case 'PENDING_VERIFICATION':
      return {
        label: 'Pending Verification',
        icon: <ShieldAlert className="w-3 h-3" />,
        className: 'text-amber-600 dark:text-amber-400',
      };
    case 'UNVERIFIED':
      return {
        label: 'Unverified',
        icon: <ShieldQuestion className="w-3 h-3" />,
        className: 'text-slate-500 dark:text-slate-400',
      };
    default:
      return {
        label: 'Unavailable',
        icon: <ShieldQuestion className="w-3 h-3" />,
        className: 'text-slate-400',
      };
  }
}

/** Booking status badge */
function getBookingStatusBadge(status: string): { label: string; className: string } {
  switch (status) {
    case 'SUBMITTED':
      return { label: 'Submitted', className: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' };
    case 'ACCEPTED':
      return { label: 'Accepted', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' };
    case 'SCHEDULED':
      return { label: 'Scheduled', className: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300' };
    case 'COMPLETED':
      return { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' };
    case 'CANCELLED':
      return { label: 'Cancelled', className: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' };
    case 'REJECTED':
      return { label: 'Rejected', className: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' };
    default:
      return { label: status || 'Unknown', className: 'bg-slate-100 text-slate-500' };
  }
}

/** Relative time display */
function relativeTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Update time unavailable';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD < 30) return `${diffD}d ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

/** Can the patient submit a booking request for this service? */
function canRequestBooking(s: DiagnosticService): boolean {
  // Patients CAN request even for UNKNOWN/UNVERIFIED — the request goes to the facility
  // Only block if explicitly OUT_OF_SERVICE
  return s.equipment_status !== 'OUT_OF_SERVICE';
}

// ===================== COMPONENT =====================

export const DiagnosticsPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [services, setServices] = useState<DiagnosticService[]>([]);
  const [bookings, setBookings] = useState<DiagnosticBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Booking Modal
  const [selectedService, setSelectedService] = useState<DiagnosticService | null>(null);
  const [requestedDate, setRequestedDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedTime, setRequestedTime] = useState('');
  const [accessibilityNotes, setAccessibilityNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setFetchError(null);
      const data = await publicHealthService.getDiagnostics({
        search: searchQuery || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
      });
      setServices(data);
    } catch (err: any) {
      setFetchError('Diagnostic availability could not be confirmed.');
      showToast(err.message || 'Diagnostic availability could not be confirmed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setBookingsLoading(true);
      const data = await publicHealthService.getDiagnosticBookings();
      setBookings(data);
    } catch (err: any) {
      // Bookings require auth — silently handle if not logged in
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchBookings();
  }, []);

  // Refetch when search/category changes
  useEffect(() => {
    fetchServices();
  }, [selectedCategory]);

  const handleSearch = () => {
    fetchServices();
  };

  const handleBookService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    try {
      const newBooking = await publicHealthService.bookDiagnostic({
        diagnosticId: selectedService.id,
        requestedDate,
        requestedTime: requestedTime || undefined,
        accessibilityNotes: accessibilityNotes || undefined,
      });
      showToast(`Booking request submitted! Reference: ${newBooking.booking_number}`, 'success');
      setSelectedService(null);
      setRequestedTime('');
      setAccessibilityNotes('');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to submit booking request', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    try {
      await publicHealthService.cancelDiagnosticBooking(bookingId);
      showToast('Booking cancelled', 'info');
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking', 'error');
    }
  };

  const categories = ['All', 'Pathology', 'Radiology', 'Cardiology', 'Microbiology'];

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-violet-800 via-purple-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-48 h-48 rounded-full bg-violet-300 blur-3xl" />
          <div className="absolute bottom-0 left-8 w-32 h-32 rounded-full bg-purple-400 blur-3xl" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-400/30 text-violet-200 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" />
            <span>National Health Grid • Diagnostic Services</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Diagnostic Services & Availability
          </h1>
          <p className="text-violet-100/90 text-sm max-w-2xl leading-relaxed">
            Find verified diagnostic services and facilities based on current availability information.
            Equipment status, availability, and fees are shown as reported by facilities. Information
            marked <span className="font-semibold text-amber-300">Unverified</span> or{' '}
            <span className="font-semibold text-slate-300">Unknown</span> has not been independently confirmed.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search service name or facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Search
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      {!isLoading && services.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
            <div className="text-2xl font-extrabold text-slate-800 dark:text-white">{services.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Services</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
            <div className="text-2xl font-extrabold text-emerald-600">{services.filter(s => s.equipment_status === 'FUNCTIONAL').length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Functional</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
            <div className="text-2xl font-extrabold text-amber-600">{services.filter(s => s.equipment_status === 'UNDER_MAINTENANCE' || s.equipment_status === 'OUT_OF_SERVICE').length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Down / Maintenance</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 text-center">
            <div className="text-2xl font-extrabold text-slate-500">{services.filter(s => s.equipment_status === 'UNKNOWN').length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Unknown Status</div>
          </div>
        </div>
      )}

      {/* Main Grid: Diagnostic Services Directory */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-16 gap-3 text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading diagnostic services from database...
          </div>
        ) : fetchError ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-rose-300 dark:border-rose-900/50 p-6 space-y-3">
            <AlertTriangle className="w-8 h-8 mx-auto text-rose-500" />
            <p className="text-rose-600 dark:text-rose-400 font-bold text-sm">{fetchError}</p>
            <p className="text-slate-400 text-xs">Please check your connection or try again.</p>
            <button
              onClick={fetchServices}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              Retry
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 space-y-2">
            <Info className="w-8 h-8 mx-auto text-slate-300" />
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold">
              {searchQuery || selectedCategory !== 'All'
                ? 'No matching diagnostic service found.'
                : 'No verified diagnostic services found.'}
            </p>
            <p className="text-slate-400 text-xs">Try adjusting your search or category filter.</p>
          </div>
        ) : (
          services.map((s) => {
            const eqBadge = getEquipmentBadge(s.equipment_status);
            const verBadge = getVerificationBadge(s.verification_status);
            const feeDisplay = getFeeDisplay(s);
            const hours = getOperationalHours(s);
            const bookable = canRequestBooking(s);

            return (
              <div
                key={s.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                  s.equipment_status === 'OUT_OF_SERVICE'
                    ? 'border-rose-200 dark:border-rose-900/50 opacity-75'
                    : s.equipment_status === 'UNKNOWN'
                    ? 'border-slate-300 dark:border-slate-700'
                    : 'border-slate-200 dark:border-slate-800 hover:border-violet-300'
                }`}
              >
                <div>
                  {/* Top row: Category + Equipment Status */}
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300 shrink-0">
                      {s.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${eqBadge.className}`}
                    >
                      {eqBadge.icon}
                      {eqBadge.label}
                    </span>
                  </div>

                  {/* Service name */}
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                    {s.service_name}
                  </h3>

                  {/* Description */}
                  {s.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{s.description}</p>
                  )}

                  {/* Details */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                      <Building2 className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                      <span className="truncate">{s.facility_name}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 w-12 shrink-0">Tier</span>
                      <span className="truncate">{s.facility_tier}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className={!s.opening_time && !s.closing_time ? 'text-slate-400 italic' : ''}>
                        {hours}
                      </span>
                    </p>

                    {/* Technician availability */}
                    <p className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold uppercase text-slate-400 w-12 shrink-0">Tech</span>
                      {s.technician_available === true && <span className="text-emerald-600">Available</span>}
                      {s.technician_available === false && <span className="text-rose-500">Not available</span>}
                      {(s.technician_available === null || s.technician_available === undefined) && (
                        <span className="text-slate-400 italic">Not confirmed</span>
                      )}
                    </p>

                    {/* TAT */}
                    {s.tat_hours !== null && s.tat_hours !== undefined ? (
                      <p className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase text-slate-400 w-12 shrink-0">TAT</span>
                        <span>{s.tat_hours} hour{s.tat_hours !== 1 ? 's' : ''}</span>
                      </p>
                    ) : (
                      <p className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold uppercase text-slate-400 w-12 shrink-0">TAT</span>
                        <span className="text-slate-400 italic">Not available</span>
                      </p>
                    )}

                    {/* Verification + Last Updated */}
                    <div className="flex items-center justify-between pt-1">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${verBadge.className}`}>
                        {verBadge.icon}
                        {verBadge.label}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Updated: {relativeTime(s.last_updated || s.updated_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer: Fee + Book action */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fee</span>
                    <strong className={`text-sm ${feeDisplay.className}`}>
                      {feeDisplay.label}
                    </strong>
                  </div>

                  <button
                    onClick={() => setSelectedService(s)}
                    disabled={!bookable}
                    title={
                      !bookable
                        ? 'This service is currently out of service and cannot accept booking requests'
                        : 'Submit a booking request for this service'
                    }
                    className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {bookable ? 'Request Booking' : 'Unavailable'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* My Diagnostic Bookings */}
      {bookings.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-violet-600" />
            <span>My Diagnostic Booking Requests</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {bookings.map((b) => {
              const statusBadge = getBookingStatusBadge(b.status);
              const canCancel = b.status === 'SUBMITTED' || b.status === 'ACCEPTED';

              return (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-violet-700 dark:text-violet-400">
                      {b.booking_number}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${statusBadge.className}`}>
                      {statusBadge.label}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{b.service_name}</h4>
                  <p className="text-slate-500">{b.facility_name}</p>
                  <p className="text-slate-400 text-[11px]">
                    Requested: {b.requested_date}
                    {b.requested_time && ` at ${formatTime(b.requested_time) || b.requested_time}`}
                  </p>
                  {b.accessibility_notes && (
                    <p className="text-slate-400 text-[11px] italic">Note: {b.accessibility_notes}</p>
                  )}
                  {b.rejection_reason && b.status === 'REJECTED' && (
                    <p className="text-rose-500 text-[11px]">Reason: {b.rejection_reason}</p>
                  )}
                  {canCancel && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="mt-1 px-3 py-1 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 text-[11px] font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Request Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Request Diagnostic Booking
              </h3>
              <button
                onClick={() => setSelectedService(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selected service info */}
            <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900 text-xs space-y-1.5">
              <p className="font-bold text-slate-900 dark:text-white">{selectedService.service_name}</p>
              <p className="text-slate-500">{selectedService.facility_name}</p>
              <p className={feeDisplay(selectedService).className}>
                {getFeeDisplay(selectedService).label}
              </p>

              {/* Warnings for unverified/unknown services */}
              {selectedService.verification_status !== 'VERIFIED' && (
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    This service has not been independently verified. Availability at the facility is not guaranteed.
                    Please confirm with the facility before traveling.
                  </p>
                </div>
              )}
              {selectedService.equipment_status === 'UNDER_MAINTENANCE' && (
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <Wrench className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700 dark:text-amber-300">
                    Equipment is currently reported as under maintenance. Your request will be queued and the facility
                    will contact you when the service resumes.
                  </p>
                </div>
              )}
              {selectedService.equipment_status === 'UNKNOWN' && (
                <div className="flex items-start gap-1.5 mt-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Equipment status is currently unknown. Your request will be forwarded to the facility
                    for confirmation.
                  </p>
                </div>
              )}
            </div>

            <form onSubmit={handleBookService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Preferred Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Preferred Time (Optional)
                </label>
                <input
                  type="time"
                  value={requestedTime}
                  onChange={(e) => setRequestedTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Accessibility or Special Needs (Optional)
                </label>
                <textarea
                  value={accessibilityNotes}
                  onChange={(e) => setAccessibilityNotes(e.target.value)}
                  placeholder="e.g., wheelchair required, translator needed, caregiver accompanying..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedService(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit Booking Request
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/** Helper function used in modal — same as top-level but avoids closure issues */
function feeDisplay(s: DiagnosticService) {
  return getFeeDisplay(s);
}
