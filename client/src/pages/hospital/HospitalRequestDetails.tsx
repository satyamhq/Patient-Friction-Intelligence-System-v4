import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { HospitalRequest } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RequestTimeline } from '../../components/patient/RequestTimeline';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Calendar,
  MapPin,
  ArrowLeft,
  Phone,
  User,
  AlertTriangle,
} from 'lucide-react';

export const HospitalRequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [request, setRequest] = useState<HospitalRequest | null>(null);
  const [hospitalNotes, setHospitalNotes] = useState('');
  const [appointmentDateTime, setAppointmentDateTime] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchRequest = async () => {
    if (!id) return;
    try {
      const res = await requestService.getById(id);
      if (res.success) {
        setRequest(res.request);
        if (res.request.hospitalNotes) setHospitalNotes(res.request.hospitalNotes);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch request.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    if (!id) return;
    setIsUpdating(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await requestService.updateStatus(id, status, hospitalNotes, appointmentDateTime);
      if (res.success) {
        setSuccessMsg(`Request status updated to ${status.replace(/_/g, ' ')}.`);
        setRequest(res.request);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Status transition failed.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (!request) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800">Request Not Found</h3>
        <Link to="/hospital/requests" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Back to Queue
          </Button>
        </Link>
      </div>
    );
  }

  const patient = request.patientId as any;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/hospital/requests"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Patient Queue
        </Link>
        <span className="text-xs font-bold text-slate-400">Request #{request.requestCode}</span>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {/* Patient Consented Information Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Patient {patient?.patientCode || 'PAT-1048'}
              </h2>
              <StatusBadge status={request.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              Department Intake: <strong className="text-teal-800">{request.departmentName}</strong>
            </p>
          </div>

          <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <span>Active Consent Verified: Shared exclusively for appointment scheduling.</span>
          </div>
        </div>

        {/* Consented Demographic & Accessibility Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Age & Gender</span>
            <p className="font-bold text-slate-800">{patient?.age} yrs • {patient?.gender}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Language</span>
            <p className="font-bold text-slate-800">{patient?.preferredLanguage}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Transit Distance</span>
            <p className="font-bold text-teal-700">{request.distanceKm || 25} km from hospital</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">Transport Autonomy</span>
            <p className="font-bold text-slate-800 uppercase">{patient?.transportAvailability || 'Low'}</p>
          </div>
        </div>

        {/* Reason for Consultation */}
        <div className="space-y-1 text-xs">
          <span className="font-bold text-slate-800">Reason for Visit & Symptoms:</span>
          <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
            {request.reasonForVisit}
          </p>
        </div>

        {request.additionalMessage && (
          <div className="space-y-1 text-xs">
            <span className="font-bold text-slate-800">Patient Accessibility Note:</span>
            <p className="text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200 leading-relaxed">
              {request.additionalMessage}
            </p>
          </div>
        )}

        {/* Attached Medical Reports */}
        {request.documentIds && request.documentIds.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-800">
              Attached Medical Reports ({request.documentIds.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {request.documentIds.map((doc: any) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{doc.title}</span>
                  </div>
                  <a
                    href={`/api/documents/${doc._id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex-shrink-0"
                  >
                    View Document
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Timeline Component */}
      <RequestTimeline currentStatus={request.status} timeline={request.timeline} />

      {/* Hospital Action & Triage Transition Console */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
          Hospital Triage Decisions & Token Allocation
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Hospital Response Notes / Token Instructions for Patient
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              rows={2}
              placeholder="e.g. Request accepted for morning Cardiology OPD. Please report to Room 12 at 09:30 AM with your Ayushman Bharat card."
              value={hospitalNotes}
              onChange={(e) => setHospitalNotes(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                isLoading={isUpdating}
                disabled={request.status === 'UNDER_REVIEW'}
              >
                Mark Under Review
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={() => handleUpdateStatus('REJECTED')}
                isLoading={isUpdating}
                disabled={request.status === 'REJECTED'}
              >
                Reject Request
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => handleUpdateStatus('ACCEPTED')}
                isLoading={isUpdating}
                icon={<CheckCircle2 className="w-4 h-4" />}
                disabled={request.status === 'ACCEPTED'}
              >
                Accept Request & Allocate OPD Slot
              </Button>

              <Button
                variant="secondary"
                size="md"
                onClick={() => handleUpdateStatus('COMPLETED')}
                isLoading={isUpdating}
                disabled={request.status === 'COMPLETED'}
              >
                Mark Visit Completed
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
