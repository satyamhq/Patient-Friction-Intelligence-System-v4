import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  AlertTriangle,
  HeartPulse,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Check,
  Stethoscope,
} from 'lucide-react';

interface ClinicalAlert {
  id: string;
  title: string;
  patientName: string;
  tokenNumber: string;
  severity: 'critical' | 'high' | 'normal';
  category: 'STAT_LAB' | 'HIGH_RISK_MATERNAL' | 'TRIAGE_RED' | 'REFERRAL_INCOMING';
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export const DoctorNotifications: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical'>('all');

  const [alerts, setAlerts] = useState<ClinicalAlert[]>([
    {
      id: 'alt-1',
      title: 'CRITICAL STAT LAB RESULT: Serum Potassium 6.8 mEq/L',
      patientName: 'Ramesh Kumar (62M)',
      tokenNumber: 'TK-014',
      severity: 'critical',
      category: 'STAT_LAB',
      message: 'Severe hyperkalemia detected. Immediate ECG order and calcium gluconate intervention recommended.',
      timestamp: '5 mins ago',
      read: false,
      actionUrl: '/doctor/consultation',
    },
    {
      id: 'alt-2',
      title: 'High-Risk Maternal Escalation from ASHA Sunita Devi',
      patientName: 'Pooja Devi (24F, 32 Weeks)',
      tokenNumber: 'TK-022',
      severity: 'high',
      category: 'HIGH_RISK_MATERNAL',
      message: 'Persistent blood pressure 150/100 mmHg with pedal edema and headache. Flagged for urgent pre-eclampsia review.',
      timestamp: '18 mins ago',
      read: false,
      actionUrl: '/doctor/opd-queue',
    },
    {
      id: 'alt-3',
      title: 'Casualty Triage RED-Code Direct Walk-In',
      patientName: 'Unknown Trauma Citizen',
      tokenNumber: 'CAS-003',
      severity: 'critical',
      category: 'TRIAGE_RED',
      message: 'Motorcycle collision victim with respiratory distress transferred to Emergency Bay 2.',
      timestamp: '34 mins ago',
      read: false,
      actionUrl: '/doctor/opd-queue',
    },
    {
      id: 'alt-4',
      title: 'Secondary Referral Transferred from District Hospital',
      patientName: 'Anil Verma (45M)',
      tokenNumber: 'REF-849',
      severity: 'normal',
      category: 'REFERRAL_INCOMING',
      message: 'Refractory peptic ulcer disease with clinical notes and endoscopy reports attached.',
      timestamp: '1 hour ago',
      read: true,
      actionUrl: '/doctor/referrals',
    },
    {
      id: 'alt-5',
      title: 'Biochemistry Panel Completed: HbA1c 9.4%',
      patientName: 'Meena Sharma (51F)',
      tokenNumber: 'TK-008',
      severity: 'normal',
      category: 'STAT_LAB',
      message: 'Uncontrolled glycemic status. Insulin titration consultation advised.',
      timestamp: '2 hours ago',
      read: true,
      actionUrl: '/doctor/lab-orders',
    },
  ]);

  const markAllAsRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  };

  const markSingleAsRead = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unread') return !a.read;
    if (filter === 'critical') return a.severity === 'critical';
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <Bell className="w-3.5 h-3.5" />
              <span>Clinical Notification Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Clinical Alerts & Triage Notifications
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Real-time clinical alerts for abnormal STAT laboratory values, frontline ASHA high-risk escalations, and incoming referral handovers.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="px-4 py-2.5 rounded-xl bg-teal-700/60 hover:bg-teal-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer self-start md:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-400 ml-2 mr-1" />
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'all' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Notifications ({alerts.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'unread' ? 'bg-teal-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setFilter('critical')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            filter === 'critical' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Critical ({alerts.filter((a) => a.severity === 'critical').length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-base text-slate-800">No Notifications in this Category</h3>
            <p className="text-xs text-slate-500 mt-1">All patient alerts are up to date.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                !alert.read
                  ? alert.severity === 'critical'
                    ? 'bg-rose-50/60 border-rose-200'
                    : 'bg-teal-50/40 border-teal-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    alert.severity === 'critical'
                      ? 'bg-rose-600 text-white'
                      : alert.severity === 'high'
                      ? 'bg-amber-500 text-white'
                      : 'bg-teal-600 text-white'
                  }`}
                >
                  {alert.severity === 'critical' ? (
                    <AlertTriangle className="w-5 h-5" />
                  ) : alert.category === 'HIGH_RISK_MATERNAL' ? (
                    <HeartPulse className="w-5 h-5" />
                  ) : (
                    <Activity className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900">{alert.title}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                      {alert.tokenNumber}
                    </span>
                    {!alert.read && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        NEW
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    {alert.message}
                  </p>

                  <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700">Patient: {alert.patientName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.timestamp}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                {!alert.read && (
                  <button
                    type="button"
                    onClick={() => markSingleAsRead(alert.id)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                    title="Mark Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                {alert.actionUrl && (
                  <Link
                    to={alert.actionUrl}
                    className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
