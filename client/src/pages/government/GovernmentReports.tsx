import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Table,
} from 'lucide-react';

export const GovernmentReports: React.FC = () => {
  const { showToast } = useToast();
  const [downloading, setDownloading] = useState<string | null>(null);

  const reports = [
    {
      id: 'rep-01',
      title: 'District Patient Access Friction & Barrier Audit',
      period: 'Monthly (August - September 2026)',
      type: 'Executive Access Telemetry',
      records: '1,420 aggregate patient flows',
      format: 'PDF / CSV',
    },
    {
      id: 'rep-02',
      title: 'Hospital Bed Utilization & Critical ICU Census Report',
      period: 'Bi-Weekly Census',
      type: 'Hospital Infrastructure',
      records: '51 district healthcare facilities',
      format: 'PDF / CSV',
    },
    {
      id: 'rep-03',
      title: 'Inter-Facility Referral Corridors & Bottleneck Audit',
      period: 'Weekly Pipeline',
      type: 'Referral Transit',
      records: '292 referral transfers',
      format: 'PDF / CSV',
    },
    {
      id: 'rep-04',
      title: 'ASHA Frontline Community Health Worker Coverage Audit',
      period: 'Monthly Field Review',
      type: 'Primary Care & Outreach',
      records: '72 active workers • 5,800 households',
      format: 'PDF / CSV',
    },
    {
      id: 'rep-05',
      title: 'Essential Drug List (EDL) & Pharmacy Stockout Risk Report',
      period: 'Weekly Inventory',
      type: 'Supply Chain & Pharmacy',
      records: '148 essential formulas',
      format: 'PDF / CSV',
    },
  ];

  const handleDownload = (id: string, format: string) => {
    setDownloading(`${id}-${format}`);
    setTimeout(() => {
      setDownloading(null);
      showToast(`Report downloaded successfully in ${format} format.`, 'success');
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
              OFFICIAL DISTRICT HEALTH EXPORTS
            </span>
            <span className="text-xs text-slate-400 font-medium">• Verified Audit Compliant</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            District Health Intelligence Reports & Exports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Download standardized, de-identified district operational reports for state health ministry submissions and quarterly administrative audits.
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
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
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
                <Table className="w-3.5 h-3.5 text-teal-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => handleDownload(rep.id, 'PDF')}
                disabled={downloading === `${rep.id}-PDF`}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-sm"
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
