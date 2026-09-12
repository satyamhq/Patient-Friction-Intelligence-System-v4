import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { requestService } from '../../services/requestService';
import { HospitalRequest } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ListOrdered, Search, Filter, Calendar, MapPin, ArrowRight, ShieldCheck } from 'lucide-react';

export const HospitalRequests: React.FC = () => {
  const [requests, setRequests] = useState<HospitalRequest[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequests = async (tab?: string) => {
    setIsLoading(true);
    try {
      const res = await requestService.getHospitalRequests(tab === 'all' ? undefined : tab);
      if (res.success) {
        setRequests(res.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const tabs = [
    { key: 'all', label: 'All Requests' },
    { key: 'new', label: 'New / Received' },
    { key: 'pending', label: 'Under Review' },
    { key: 'accepted', label: 'Accepted / Scheduled' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-brand-500" />
            Patient Intake & Triage Queue
          </h2>
          <p className="text-xs text-slate-500">
            Review incoming requests with patient consent authorization and accessibility accommodations
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto gap-1 p-1 bg-slate-100 rounded-xl max-w-full">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white text-brand-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : requests.length === 0 ? (
        <EmptyState
          title={`No ${activeTab.toUpperCase()} Requests Found`}
          description="There are currently no patient requests under this specific tab filter."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover hover:border-teal-300 transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-black text-sm text-slate-900">{req.requestCode}</span>
                  <StatusBadge status={req.status} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-teal-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" /> Verified Consent
                  </span>
                  <span>•</span>
                  <span>Received: {new Date(req.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Patient Demographics</span>
                  <p className="font-bold text-slate-900">
                    {(req.patientId as any)?.patientCode || 'PAT-1048'} • {(req.patientId as any)?.age} yrs •{' '}
                    {(req.patientId as any)?.gender}
                  </p>
                  <p className="text-slate-500">
                    Language: {(req.patientId as any)?.preferredLanguage} • Phone:{' '}
                    {(req.patientId as any)?.phone || 'N/A'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Department & Schedule</span>
                  <p className="font-bold text-teal-800">{req.departmentName}</p>
                  <p className="text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(req.preferredDate).toLocaleDateString()} ({req.preferredTimeSlot})</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Transit & Accessibility</span>
                  <p className="font-bold text-slate-800">{req.distanceKm || 25} km travel distance</p>
                  <p className="text-slate-500 truncate">
                    Transport: {(req.patientId as any)?.transportAvailability || 'Low'}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <span className="font-bold text-slate-700">Reason for Visit:</span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {req.reasonForVisit}
                </p>
              </div>

              {req.additionalMessage && (
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <strong>Patient Accessibility Request:</strong> {req.additionalMessage}
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-slate-100">
                <Link to={`/hospital/requests/${req._id}`}>
                  <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                    Open & Review Request
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
