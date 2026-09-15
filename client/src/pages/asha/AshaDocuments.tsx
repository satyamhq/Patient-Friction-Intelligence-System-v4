import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Info,
  Shield,
  Download,
  ExternalLink,
  User,
  X,
  CreditCard,
} from 'lucide-react';

export const AshaDocuments: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'ABHA' | 'PMJAY' | 'CONCESSIONS'>('ABHA');

  const [documentRequests, setDocumentRequests] = useState([
    {
      id: 'doc-01',
      patientName: 'Sunita Devi',
      type: 'ABHA Health ID',
      status: 'VERIFIED',
      idNumber: '91-4582-7391-2041',
      details: 'ABDM PHR linked with Phagwara Rural PHC OPD profile.',
    },
    {
      id: 'doc-02',
      patientName: 'Amrik Chand',
      type: 'Ayushman Bharat PM-JAY Card',
      status: 'VERIFIED',
      idNumber: 'PMJAY-PB-88391',
      details: 'Eligible for secondary and tertiary hospital diagnostic cover.',
    },
    {
      id: 'doc-03',
      patientName: 'Mohan Lal Sharma',
      type: 'Senior Citizen Travel Concession',
      status: 'IN_PROGRESS',
      idNumber: 'Pending Verification',
      details: 'Transport voucher for Civil Hospital Kapurthala OPD visits.',
    },
  ]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Healthcare Entitlements & Identity Desk</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            Documents & Service Assistance
          </h1>
          <p className="text-xs text-slate-500">
            Facilitating ABHA generation, Ayushman Bharat PM-JAY coverage verification, and travel concessions
          </p>
        </div>
      </div>

      {/* ABDM Ecosystem Transparent Notice (Section 30) */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-bold">
            ABDM / National Health Authority (NHA) Ecosystem Adapter: Integration Required
          </strong>
          <p className="text-slate-600">
            Official production connection requires authorized ABDM sandbox / production keys (HFR, HPR, ABHA OAuth 2.0). PFIS manages beneficiary documentation workflows cleanly without fabricating fake live Aadhaar OTP or biometric API confirmations.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'ABHA', label: 'Ayushman Bharat Health Account (ABHA)' },
          { id: 'PMJAY', label: 'PM-JAY Scheme Cards' },
          { id: 'CONCESSIONS', label: 'Concessions & Free Transit Passes' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Document Roster */}
      <div className="space-y-3">
        {documentRequests.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 hover:border-teal-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <strong className="text-sm text-slate-900">{doc.patientName}</strong>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-800 border border-teal-200">
                  {doc.type}
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    doc.status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  {doc.status}
                </span>
              </div>

              <p className="text-xs text-slate-700 font-mono font-semibold">
                ID / Number: {doc.idNumber}
              </p>

              <p className="text-[11px] text-slate-500">
                {doc.details}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => showToast('Document verified in local registry.', 'info')}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
