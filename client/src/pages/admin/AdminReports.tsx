import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Download,
  Calendar,
  Table,
  ShieldCheck,
  Building2,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const reports = [
    {
      id: 'adm-rep-01',
      title: 'Statewide Healthcare Access Friction Master Audit',
      period: 'Quarterly (Q3 2026)',
      type: 'State Strategic Intelligence',
      records: 'All 5 Punjab Districts • 482 Facilities',
      format: 'PDF / CSV',
    },
    {
      id: 'adm-rep-02',
      title: 'Inter-District Referral Drop-off & Emergency Transit Loss Analysis',
      period: 'Monthly Evaluation',
      type: 'Referral Logistics',
      records: '171 Cross-district corridors',
      format: 'PDF / CSV',
    },
    {
      id: 'adm-rep-03',
      title: 'Health Budget & Resource Intervention ROI Dossier',
      period: 'Fiscal Year 2026-27',
      type: 'Macro Policy & Budget',
      records: '12 Operational Interventions Modeled',
      format: 'PDF / CSV',
    },
    {
      id: 'adm-rep-04',
      title: 'Statewide Hospital NQAS Quality Index & Accreditation Audit',
      period: 'Semi-Annual Audit',
      type: 'Accreditation & Standards',
      records: '51 Verified District Hospitals',
      format: 'PDF / CSV',
    },
    {
      id: 'adm-rep-05',
      title: 'Cryptographic Governance Audit Ledger & DPDP Compliance Summary',
      period: 'Continuous Immutable Trail',
      type: 'Governance & Privacy',
      records: '2,400+ Security Events',
      format: 'PDF / CSV',
    },
  ];

  const handleDownload = (id: string, format: string) => {
    setDownloading(`${id}-${format}`);
    setTimeout(() => {
      setDownloading(null);
      showToast(`State strategic dossier downloaded successfully in ${format} format.`, 'success');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
              STATE HEALTH ADMINISTRATION DOSSIERS
            </span>
            <span className="text-xs text-slate-400 font-medium">• Ministerial Policy Level</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            State Health Strategic Intelligence & Policy Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Macro-level policy reports, epidemiological access disparity summaries, and budgetary allocation dossiers for Punjab Health Ministry review.
          </p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {rep.type}
                </span>
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {rep.period}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                {rep.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Coverage: <strong className="text-slate-700">{rep.records}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleDownload(rep.id, 'CSV')}
                disabled={downloading === `${rep.id}-CSV`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all"
              >
                <Table className="w-3.5 h-3.5 text-purple-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleDownload(rep.id, 'PDF')}
                disabled={downloading === `${rep.id}-PDF`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
