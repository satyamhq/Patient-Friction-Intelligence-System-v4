import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Cpu,
  Phone,
  Database,
  Save,
  CheckCircle2,
  RefreshCw,
  HardDrive,
  Lock,
  Server,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AdminSystemSettings: React.FC = () => {
  const [saved, setSaved] = useState(false);
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [helplineNumber, setHelplineNumber] = useState('+91 6205844155');
  const [abdmCompliance, setAbdmCompliance] = useState(true);
  const [fhirValidation, setFhirValidation] = useState(true);
  const [encryptionAtRest, setEncryptionAtRest] = useState(true);
  const [auditLogRetentionDays, setAuditLogRetentionDays] = useState('365');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold mb-3 border border-purple-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Platform Governance & System Administration</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">System & Security Settings</h1>
            <p className="text-purple-100 text-sm mt-1 max-w-xl">
              Configure system intelligence engines, ABDM compliance protocols, teleconsultation relays, and platform safeguards.
            </p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>Apply Global Settings</span>
          </Button>
        </div>
      </div>

      {saved && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">Platform configuration updated and broadcast across all service nodes!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Intelligence Engine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Intelligence Core</h2>
              <p className="text-xs text-slate-500">Gemini LLM & 1,000+ Healthcare Q&A Engine Configuration</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Primary LLM Reasoning Model
              </label>
              <select
                value={aiModel}
                onChange={(e) => setAiModel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="gemini-2.5-flash">Google Gemini 2.5 Flash (Recommended - Sub-500ms response)</option>
                <option value="gemini-2.5-pro">Google Gemini 2.5 Pro (Deep Clinical Reasoning)</option>
                <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Preview)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Direct Helpline Destination
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={helplineNumber}
                  onChange={(e) => setHelplineNumber(e.target.value)}
                  className="w-full px-3 py-2 pl-9 border border-slate-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                All patient & citizen emergency calls route directly to this 24/7 designated emergency desk.
              </p>
            </div>
          </div>
        </div>

        {/* Security & Regulatory Standards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ABDM & Data Security</h2>
              <p className="text-xs text-slate-500">National Digital Health Mission compliance standards</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-800">ABDM M1, M2, M3 Compliance</p>
                <p className="text-xs text-slate-500">Ayushman Bharat Health Account (ABHA) consent manager</p>
              </div>
              <input
                type="checkbox"
                checked={abdmCompliance}
                onChange={(e) => setAbdmCompliance(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-800">FHIR v4.0.1 Schema Validation</p>
                <p className="text-xs text-slate-500">Validate all clinical notes, lab results & prescriptions</p>
              </div>
              <input
                type="checkbox"
                checked={fhirValidation}
                onChange={(e) => setFhirValidation(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-800">AES-256 Encryption at Rest</p>
                <p className="text-xs text-slate-500">Government-grade health vault protection</p>
              </div>
              <input
                type="checkbox"
                checked={encryptionAtRest}
                onChange={(e) => setEncryptionAtRest(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Audit & Data Retention */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Audit & Storage Governance</h2>
              <p className="text-xs text-slate-500">Data retention policies and immutable ledger settings</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Audit Log Retention Duration
              </label>
              <select
                value={auditLogRetentionDays}
                onChange={(e) => setAuditLogRetentionDays(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="90">90 Days (Quarterly Audit)</option>
                <option value="180">180 Days (Half-Yearly)</option>
                <option value="365">365 Days (Full Statutory Year)</option>
                <option value="1825">5 Years (Long-Term Regulatory Retention)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div>
                <span className="font-semibold block text-slate-800">Automated Daily Backups</span>
                <span>Encrypted snapshot saved to disaster recovery cluster</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">
                Active
              </span>
            </div>
          </div>
        </div>

        {/* System Operations & Maintenance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Platform Operations</h2>
              <p className="text-xs text-slate-500">Maintenance controls and emergency cluster state</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-800">Platform Maintenance Mode</p>
                <p className="text-xs text-slate-500">Temporarily restrict public registration and portal logins</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenanceMode}
                  onChange={(e) => setMaintenanceMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="outline"
                className="w-full text-xs text-slate-700 border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-1.5"
                onClick={() => alert('Cache purge broadcasted to edge CDN and Redis clusters.')}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Purge System Edge Cache
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
