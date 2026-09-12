import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { HospitalRequest } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ListOrdered, MapPin, Calendar, Clock, ArrowRight, Building2, FileText } from 'lucide-react';

export const PatientRequests: React.FC = () => {
  const [requests, setRequests] = useState<HospitalRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await requestService.getPatientRequests();
        if (res.success) {
          setRequests(res.requests || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-brand-500" />
            My Hospital Intake Requests
          </h2>
          <p className="text-xs text-slate-500">
            Track real-time status transitions, triage updates, and scheduled visit slots
          </p>
        </div>

        <Link to="/patient/hospitals">
          <Button variant="primary" size="sm" icon={<Building2 className="w-4 h-4" />}>
            New Hospital Request
          </Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="No Requests Submitted Yet"
          description="Search for nearby hospitals and submit an intake request with your verified consent."
          actionText="Find Nearby Hospitals"
          onAction={() => (window.location.href = '/patient/hospitals')}
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-black text-sm text-slate-900 tracking-tight">
                    {req.requestCode}
                  </span>
                  <StatusBadge status={req.status} size="sm" />
                </div>
                <span className="text-xs text-slate-400">
                  Submitted: {new Date(req.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Target Facility</span>
                  <h4 className="font-bold text-sm text-slate-900">{(req.hospitalId as any)?.name || 'Medical Center'}</h4>
                  <p className="text-slate-500">{(req.hospitalId as any)?.address}, {(req.hospitalId as any)?.city}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Department & Preferred Time</span>
                  <p className="font-bold text-slate-800">{req.departmentName}</p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(req.preferredDate).toLocaleDateString()} ({req.preferredTimeSlot})</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Transit & Accessibility</span>
                  <p className="font-bold text-teal-700">{req.distanceKm || 25} km travel distance</p>
                  <p className="text-slate-500 truncate">Reason: {req.reasonForVisit}</p>
                </div>
              </div>

              {req.hospitalNotes && (
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900">
                  <strong>Hospital Feedback:</strong> {req.hospitalNotes}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Link to={`/patient/requests/${req._id}`}>
                  <Button variant="outline" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    View Live Timeline & Consented Data
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
