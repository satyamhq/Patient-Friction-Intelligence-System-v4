import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { HospitalRequest } from '../../types';
import { RequestTimeline } from '../../components/patient/RequestTimeline';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Building2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  ArrowLeft,
  Phone,
  CheckCircle2,
} from 'lucide-react';

export const RequestDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [request, setRequest] = useState<HospitalRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReq = async () => {
      if (!id) return;
      try {
        const res = await requestService.getById(id);
        if (res.success) {
          setRequest(res.request);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadReq();
  }, [id]);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (!request) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800">Request Not Found</h3>
        <Link to="/patient/requests" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Back to Requests
          </Button>
        </Link>
      </div>
    );
  }

  const hospital = request.hospitalId as any;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          to="/patient/requests"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Requests
        </Link>
        <span className="text-xs font-bold text-slate-400">Request #{request.requestCode}</span>
      </div>

      {/* Header Request Summary */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {hospital?.name || 'Medical Facility'}
              </h2>
              <StatusBadge status={request.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>{hospital?.address}, {hospital?.city}</span>
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block">Department</span>
            <span className="text-sm font-bold text-teal-700">{request.departmentName}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Visit Schedule</span>
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>{new Date(request.preferredDate).toLocaleDateString()}</span>
            </p>
            <p className="text-slate-500">{request.preferredTimeSlot}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Distance & Transit</span>
            <p className="font-bold text-slate-800">{request.distanceKm || 25} km transit</p>
            <p className="text-slate-500">Est. ~{request.estimatedTravelTimeMinutes || 45} mins</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Accessibility Score</span>
            <p className="font-bold text-teal-700">{request.accessibilityScoreAtRequest || 75} / 100</p>
            <p className="text-slate-500">Barrier: {request.topBarrierAtRequest || 'Transport'}</p>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold text-slate-700">Reason for Consultation:</span>
          <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
            {request.reasonForVisit}
          </p>
        </div>

        {request.additionalMessage && (
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-700">Accessibility Accommodation Note:</span>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {request.additionalMessage}
            </p>
          </div>
        )}

        {/* Live Ambulance & Doorstep Care Escort Tracking Status */}
        {(request.needsAmbulance || request.needsCareEscort) && (
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🚗</span> Active Transport & Care-Attendant Dispatches:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Ambulance Card */}
              {request.needsAmbulance && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5 text-xs">
                      <span className="text-base">🚑</span> Hospital Ambulance
                    </span>
                    <span className="text-[10px] font-bold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 px-2 py-0.5 rounded-full">
                      {request.ambulanceBooking?.status || 'DISPATCHED'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <p><strong>Vehicle:</strong> {request.ambulanceBooking?.vehicleNumber || 'PB-08-AM-1082'}</p>
                    <p><strong>Driver:</strong> {request.ambulanceBooking?.driverName || 'Gurmeet Singh'} ({request.ambulanceBooking?.driverPhone || '+91 98140 12345'})</p>
                    <p><strong>Estimated Arrival:</strong> ~{request.ambulanceBooking?.estimatedArrivalMinutes || 18} mins at home</p>
                    <p className="text-[10px] text-slate-500"><strong>Pickup At:</strong> {request.ambulanceBooking?.pickupAddress || 'Patient Home Address'}</p>
                  </div>
                </div>
              )}

              {/* Doorstep Care Escort Card */}
              {request.needsCareEscort && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5 text-xs">
                      <span className="text-base">🤝</span> Doorstep Care Escort
                    </span>
                    <span className="text-[10px] font-bold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full">
                      {request.careEscortBooking?.status || 'ASSIGNED'}
                    </span>
                  </div>
                  <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                    <p><strong>Care Sahayak:</strong> {request.careEscortBooking?.escortName || 'Smt. Sunita Sharma'}</p>
                    <p><strong>Role:</strong> {request.careEscortBooking?.escortRole || 'Hospital Doorstep Care Attendant'}</p>
                    <p><strong>Phone:</strong> {request.careEscortBooking?.escortPhone || '+91 98765 88990'}</p>
                    <p className="text-[10px] text-emerald-800 dark:text-emerald-300 font-medium">
                      ✓ Will escort you through doctor checkup & safely drop you back home.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Visual Workflow Timeline */}
      <RequestTimeline currentStatus={request.status} timeline={request.timeline} />

      {/* Consented Data Stream & Attached Documents */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
          <div>
            <h4 className="text-sm font-bold text-slate-900">Consented Data & Attachments</h4>
            <p className="text-[11px] text-slate-500">Information shared exclusively under active consent</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {((request.consentId as any)?.dataShared || ['demographics', 'reason_for_visit', 'accessibility_friction']).map(
              (item: string, i: number) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 font-medium"
                >
                  ✓ {item.replace(/_/g, ' ')}
                </span>
              )
            )}
          </div>

          {request.documentIds && request.documentIds.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="font-bold text-slate-700">Attached Documents ({request.documentIds.length}):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {request.documentIds.map((doc: any) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{doc.title}</span>
                    </div>
                    <a
                      href={`/api/documents/${doc._id}/file`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-bold text-brand-600 hover:text-brand-700"
                    >
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
