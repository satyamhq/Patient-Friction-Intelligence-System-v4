import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/patientService';
import { FrictionProfile, FrictionInteraction } from '../../types';
import { FrictionRadarChart } from '../../components/charts/FrictionRadarChart';
import { FrictionBarChart } from '../../components/charts/FrictionBarChart';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import {
  Activity,
  MapPin,
  Bus,
  Laptop,
  Languages,
  Users2,
  FileCheck2,
  Coins,
  Clock,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const FrictionFingerprint: React.FC = () => {
  const [profile, setProfile] = useState<FrictionProfile | null>(null);
  const [interactions, setInteractions] = useState<FrictionInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFriction = async () => {
      try {
        const res = await patientService.getFrictionProfile();
        if (res.success) {
          setProfile(res.frictionProfile);
          setInteractions(res.interactions || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadFriction();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (!profile) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800">No Friction Profile Calculated</h3>
        <Link to="/patient/profile" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Configure Profile
          </Button>
        </Link>
      </div>
    );
  }

  const p = profile as any;
  const factors = [
    { key: 'transport', label: 'Transport Availability', factor: p.transport, icon: Bus },
    { key: 'travel', label: 'Travel Distance & Road Quality', factor: p.travel, icon: MapPin },
    { key: 'cost', label: 'Financial & Out-of-Pocket Cost', factor: p.cost, icon: Coins },
    { key: 'familySupport', label: 'Family & Caregiver Support', factor: p.familySupport || p.familysupport, icon: Users2 },
    { key: 'digitalAccess', label: 'Digital Access & Literacy', factor: p.digitalAccess || p.digitalaccess, icon: Laptop },
    { key: 'appointmentTiming', label: 'Appointment Timing & Wage Loss', factor: p.appointmentTiming || p.appointmenttiming, icon: Clock },
    { key: 'documentation', label: 'Documentation Readiness', factor: p.documentation, icon: FileCheck2 },
    { key: 'language', label: 'Language & Dialect Match', factor: p.language, icon: Languages },
  ];

  const overallScore = p.overallAccessibilityScore ?? p.overallaccessibilityscore ?? 65;
  const frictionLevel = p.frictionLevel || p.frictionlevel || 'MODERATE';

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Activity className="w-6 h-6 text-brand-500" />
                Patient Friction Fingerprint™
              </h2>
              <StatusBadge status={frictionLevel} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Deterministic, explainable quantification of non-clinical healthcare barriers
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Accessibility</span>
              <span className="text-2xl font-black text-brand-700">
                {overallScore} / 100
              </span>
            </div>
          </div>
        </div>

        {/* Explainable Rationale Banner */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
          <p className="font-bold text-slate-900">Deterministic Engine Rationale:</p>
          <p className="text-slate-600 leading-relaxed">{profile.explanation}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100">
            <span className="text-[10px] text-teal-700 font-bold uppercase block">Top Barrier</span>
            <p className="font-bold text-teal-950 truncate">{profile.topBarrier}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Secondary Barrier</span>
            <p className="font-bold text-slate-800 truncate">{profile.secondaryBarrier}</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Overall Friction Index</span>
            <p className="font-bold text-slate-800">{profile.overallFrictionScore} / 100</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Evaluated Factors</span>
            <p className="font-bold text-slate-800">8 Dimensions</p>
          </div>
        </div>
      </div>

      {/* Visual Charts: Radar & Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FrictionRadarChart profile={profile} height={340} />
        <FrictionBarChart profile={profile} height={340} />
      </div>

      {/* Compound Friction Synergies Banner (Interaction Engine) */}
      {interactions.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-700" />
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                Friction Interaction Synergies Detected ({interactions.length})
              </h3>
              <p className="text-xs text-amber-800">
                Non-linear barrier amplification when multiple high friction factors co-occur
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interactions.map((interaction, i) => (
              <div
                key={i}
                className="p-4 bg-white/90 backdrop-blur-sm rounded-xl border border-amber-200 text-xs space-y-2 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    {interaction.primaryDimension} + {interaction.secondaryDimension}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                    Multiplier: {interaction.interactionMultiplier}x
                  </span>
                </div>

                <p className="text-slate-600 leading-relaxed text-[11px]">
                  {interaction.mechanismExplanation}
                </p>

                <div className="p-2 bg-amber-50 rounded-lg text-amber-900 text-[11px] font-medium">
                  💡 <strong>Recommended Mitigation:</strong> {interaction.recommendedMitigation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8 Detailed Dimension Cards */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-500" /> Granular Factor Breakdowns
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factors.map((f) => {
            const Icon = f.icon;
            const factor = f.factor;
            return (
              <div
                key={f.key}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{f.label}</h4>
                      <span className="text-[11px] text-slate-400 font-medium">
                        Weight: {Math.round(factor.weight * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-black text-slate-900">{factor.score} / 100</span>
                    <div className="mt-0.5">
                      <StatusBadge status={factor.level} size="sm" />
                    </div>
                  </div>
                </div>

                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      factor.score >= 75
                        ? 'bg-rose-500'
                        : factor.score >= 50
                        ? 'bg-orange-500'
                        : factor.score >= 25
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${factor.score}%` }}
                  />
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {factor.reason}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
