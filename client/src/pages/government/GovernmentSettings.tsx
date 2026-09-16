import React, { useState } from 'react';
import {
  Settings,
  Shield,
  Bell,
  MapPin,
  Sliders,
  Database,
  Save,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const GovernmentSettings: React.FC = () => {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [district, setDistrict] = useState('All Districts (Statewide)');
  const [frictionThreshold, setFrictionThreshold] = useState('70');
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailDigest, setEmailDigest] = useState('daily');
  const [webhookUrl, setWebhookUrl] = useState('https://statehealth.gov.in/api/v1/friction-alerts');
  const [dataSyncInterval, setDataSyncInterval] = useState('15');

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Health Authority & Regulatory Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold">Public Health Authority Settings</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Configure jurisdiction thresholds, friction telemetry alarms, escalation protocols, and state reporting integrations.
            </p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 self-start sm:self-auto">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="font-semibold">Authority configuration saved and synchronized across district servers!</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Jurisdiction & Coverage */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Jurisdiction & Boundaries</h2>
              <p className="text-xs text-slate-500">Define active surveillance scope and administrative boundaries</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Active Authority Domain
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="All Districts (Statewide)">All Districts (Statewide Command)</option>
                <option value="Patna District">Patna District</option>
                <option value="Gaya District">Gaya District</option>
                <option value="Muzaffarpur District">Muzaffarpur District</option>
                <option value="Bhagalpur District">Bhagalpur District</option>
                <option value="Purnia District">Purnia District</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Telemetry Sync Cadence
              </label>
              <select
                value={dataSyncInterval}
                onChange={(e) => setDataSyncInterval(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="5">Every 5 Minutes (Real-Time Casualty Monitoring)</option>
                <option value="15">Every 15 Minutes (Standard Operational)</option>
                <option value="60">Every 1 Hour (Summary Sync)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Friction Trigger Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Friction Alert Thresholds</h2>
              <p className="text-xs text-slate-500">Automated alarm levels based on Patient Friction Index (PFI)</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Critical Escalation Score (PFI)
                </label>
                <span className="text-sm font-bold text-red-600">{frictionThreshold}/100</span>
              </div>
              <input
                type="range"
                min="50"
                max="90"
                value={frictionThreshold}
                onChange={(e) => setFrictionThreshold(e.target.value)}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <p className="text-xs text-slate-400 mt-1">
                Scores exceeding {frictionThreshold} automatically trigger District Magistrate action directives.
              </p>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="text-sm font-semibold text-slate-800">Auto-Escalate to District CMO</p>
                <p className="text-xs text-slate-500">Notify Chief Medical Officer when high friction persists for &gt; 3 hours</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoEscalate}
                  onChange={(e) => setAutoEscalate(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications & Dispatch */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notification & Alert Channels</h2>
              <p className="text-xs text-slate-500">Channels for government emergency bulletins and shift briefs</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Urgent SMS Alerts to CMOs</p>
                  <p className="text-xs text-slate-500">Send high friction alerts directly to registered mobiles</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Executive Email Summary Digest
              </label>
              <select
                value={emailDigest}
                onChange={(e) => setEmailDigest(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="daily">Daily Morning Digest (08:00 AM)</option>
                <option value="weekly">Weekly Strategic Overview (Mondays)</option>
                <option value="realtime">Real-time for Critical Events Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* API & State Integration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">State Health Portal Webhook</h2>
              <p className="text-xs text-slate-500">Downstream integration with State Digital Health Mission</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Webhook Endpoint URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                System automatically sends JSON payloads on PFI anomaly events, hospital bed shortages, and high-frequency maternal escalations.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
