import React, { useState, useEffect } from 'react';
import { frictionReportService, FrictionReportItem } from '../../services/frictionReportService';
import { useToast } from '../../context/ToastContext';
import {
  ShieldAlert,
  Send,
  RefreshCw,
  Clock,
  CheckCircle2,
  Building2,
  HelpCircle,
  MessageSquare,
  AlertCircle,
  FileBadge,
} from 'lucide-react';

const BARRIER_CATEGORIES = [
  { key: 'WAITING_TIME', label: 'Excessive OPD waiting' },
  { key: 'DOCTOR_UNAVAILABLE', label: 'Doctor/Specialist unavailable' },
  { key: 'MEDICINE_STOCKOUT', label: 'Medicine unavailable' },
  { key: 'REGISTRATION_ISSUE', label: 'Registration/queue problem' },
  { key: 'FACILITY_ACCESSIBILITY', label: 'Accessibility barrier' },
  { key: 'UNEXPECTED_COST', label: 'Unexpected healthcare cost' },
  { key: 'STAFF_BEHAVIOR', label: 'Staff/service grievance' },
  { key: 'NAVIGATION_ISSUE', label: 'Wayfinding/signage problem' },
];

export const PatientFrictionReportPage: React.FC = () => {
  const { showToast } = useToast();
  const [reports, setReports] = useState<FrictionReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [hospitalName, setHospitalName] = useState('District Civil Hospital, Jalandhar');
  const [category, setCategory] = useState('WAITING_TIME');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [description, setDescription] = useState('');

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await frictionReportService.getReports();
      if (res.success && res.reports) {
        setReports(res.reports);
      }
    } catch {
      showToast('Could not load past reports from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      showToast('Please describe the healthcare barrier.', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await frictionReportService.createReport({
        hospitalName,
        category,
        severity,
        description: description.trim(),
      });
      if (res.success) {
        const idLabel = res.reportId || res.report?.reportId || 'RPT-New';
        showToast(`Report submitted successfully. Reference ID: ${idLabel}`, 'success');
        setDescription('');
        fetchReports();
      }
    } catch {
      showToast('Failed to submit report. Please check connection and try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
      case 'PENDING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Submitted
          </span>
        );
      case 'UNDER_REVIEW':
      case 'INVESTIGATING':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            Under Review
          </span>
        );
      case 'ACTION_TAKEN':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            Action Taken
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  const getCategoryLabel = (key: string) => {
    const found = BARRIER_CATEGORIES.find((c) => c.key === key);
    return found ? found.label : key;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Page Heading */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Report a Healthcare Barrier
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Submit non-clinical healthcare access obstacles experienced at public facilities. All reports are verified and tracked by district health authorities.
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      {/* Form: Tell Us About the Barrier */}
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-5"
      >
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            Tell Us About the Barrier
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Provide details regarding the facility and nature of the barrier.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Healthcare Facility
            </label>
            <input
              type="text"
              required
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="e.g. District Civil Hospital, Jalandhar"
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Severity Level
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="LOW">Low (Minor inconvenience / short delay)</option>
              <option value="MEDIUM">Medium (Significant wait / travel obstacle)</option>
              <option value="HIGH">High (Disrupted intake / missed OPD slot)</option>
              <option value="CRITICAL">Critical (Total inability to reach or complete care)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Barrier Category
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {BARRIER_CATEGORIES.map((cat) => (
              <label
                key={cat.key}
                className={`p-3 rounded-2xl border text-xs font-medium cursor-pointer transition-all flex items-center gap-3 ${
                  category === cat.key
                    ? 'bg-teal-50 text-teal-950 border-teal-500 shadow-xs dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-700'
                    : 'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat.key}
                  checked={category === cat.key}
                  onChange={(e) => setCategory(e.target.value)}
                  className="text-teal-600 focus:ring-teal-500 h-4 w-4"
                />
                <span className="font-semibold">{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Detailed Description of the Barrier
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe what occurred, time of event, counter number, or specific transit/facility problem encountered..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </form>

      {/* Reported Barriers History & Status Tracking */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white">
              Your Submitted Barrier Reports & Status
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Persistent tracking directly from the state healthcare registry.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg">
            {reports.length} Recorded
          </span>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
            Loading reports from database...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            No healthcare barriers reported yet. Use the form above to submit an incident.
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r, idx) => {
              const displayId = r.reportId || r.id || `RPT-${1000 + idx}`;
              const formattedDate = r.createdAt
                ? new Date(r.createdAt).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Recently Logged';

              return (
                <div
                  key={r.id || r.reportId || idx}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                        {displayId}
                      </span>
                      <strong className="text-slate-800 dark:text-slate-200">
                        {r.hospitalName}
                      </strong>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {getCategoryLabel(r.category)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formattedDate}
                      </span>
                    </div>

                    <div>{getStatusBadge(r.status)}</div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {r.description}
                  </p>

                  {r.resolutionNotes && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-xs text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 space-y-0.5">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Official Action / Resolution Note:
                      </div>
                      <p>{r.resolutionNotes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
