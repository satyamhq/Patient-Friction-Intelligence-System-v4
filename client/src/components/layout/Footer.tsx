import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 pt-10 sm:pt-12 pb-[max(2rem,env(safe-area-inset-bottom,2rem))]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Purpose */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Activity className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                Patient Friction Index & Access Platform (PFIS)
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Healthcare may be available, but is it practically accessible? PFIS identifies non-clinical
              socio-geographic barriers (from transit deficits to loss of daily subsistence wages) and empowers
              health administrators to simulate high-yield community interventions.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                Deterministic Explainability
              </span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="w-4 h-4 text-teal-400" />
                Zero Clinical Diagnosis
              </span>
            </div>
          </div>

          {/* Col 2: Platform Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Platform</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/patient/hospitals" className="hover:text-teal-400 transition-colors">
                  Find Nearby Hospitals
                </Link>
              </li>
              <li>
                <Link to="/patient/friction" className="hover:text-teal-400 transition-colors">
                  Friction Fingerprint Engine
                </Link>
              </li>
              <li>
                <Link to="/admin/simulator" className="hover:text-teal-400 transition-colors">
                  What-If Intervention Simulator
                </Link>
              </li>
              <li>
                <Link to="/admin/care-leakage" className="hover:text-teal-400 transition-colors">
                  Care Leakage Funnel
                </Link>
              </li>
              <li>
                <Link to="/admin/friction-map" className="hover:text-teal-400 transition-colors">
                  Population Friction Heatmap
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Safety */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-white mb-3">Governance</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/about" className="hover:text-teal-400 transition-colors">
                  Non-Clinical Safety Mandate
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-teal-400 transition-colors">
                  Hospital Onboarding & Integration
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Consent & Privacy Auditing</span>
              </li>
              <li>
                <span className="text-slate-400">National Health Accessibility Platform</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 pb-12 sm:pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-3">
          <p>© {new Date().getFullYear()} Patient Friction Index & Access Platform (PFIS). All rights reserved.</p>
          <p className="text-[11px] text-slate-400 text-center sm:text-right">
            Non-Clinical Healthcare Accessibility Platform • Operational Decision Support
          </p>
        </div>
      </div>
    </footer>
  );
};
