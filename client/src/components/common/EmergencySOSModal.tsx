import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { publicHealthService } from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import {
  Ambulance,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  X,
  Radio,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencySOSModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchData, setDispatchData] = useState<any>(null);
  const [emergencyType, setEmergencyType] = useState('Cardiac / Chest Pain');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTriggerSOS = async () => {
    try {
      setIsDispatching(true);
      const res = await publicHealthService.triggerEmergencySOS({
        patientName: 'Sunita Devi (Citizen SOS)',
        phone: '98140-12345',
        locationName: 'Medha Valley, Satara District (GPS: 17.7285° N, 73.8377° E)',
        emergencyType,
      });
      setDispatchData(res);
      showToast('108 Emergency Ambulance Dispatched to your GPS Location!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to dispatch SOS', 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[99999] overflow-y-auto p-4 sm:p-6 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl border-2 border-rose-500/60 w-full max-w-lg p-5 sm:p-7 shadow-2xl space-y-4 relative my-auto max-h-[92vh] overflow-y-auto shrink-0">
        {/* Top Emergency Beacon Effect */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500 animate-pulse" />

        <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
              <Ambulance className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
                108 Emergency Paramedic Network
              </span>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                Emergency 108 Ambulance Dispatch
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {dispatchData ? (
          <div className="space-y-4 animate-scale-up">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300">
                  {dispatchData.dispatch.dispatch_number}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-600 text-white flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-spin" /> Ambulance En Route
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-white">
                Vehicle: {dispatchData.dispatch.assigned_ambulance_vehicle}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200 dark:border-emerald-800/60">
                <div>
                  <span className="text-slate-500 block">Estimated Arrival</span>
                  <strong className="text-emerald-700 dark:text-emerald-300 text-base font-extrabold flex items-center gap-1">
                    <Clock className="w-4 h-4" /> ~{dispatchData.etaMinutes} Minutes
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Direct Emergency Line</span>
                  <strong className="text-slate-900 dark:text-white text-base font-extrabold flex items-center gap-1">
                    <PhoneCall className="w-4 h-4 text-emerald-600" /> 108
                  </strong>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
              <span className="text-slate-400 uppercase font-bold text-[10px] block">
                Destination Emergency Trauma Hospital
              </span>
              <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{dispatchData.destinationHospital?.name || 'District Civil Hospital Satara'}</span>
              </p>
              <p className="text-emerald-600 font-semibold text-[11px]">
                ICU / Casualty Alerted • 24/7 Blood Bank Ready
              </p>
            </div>

            <p className="text-xs text-slate-500 text-center italic">
              "Keep the patient calm and seated. Paramedic will contact you on your registered phone."
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs shadow cursor-pointer transition-all"
            >
              Close Window & Keep Tracker Running
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                Emergency Situation Type
              </label>
              <select
                value={emergencyType}
                onChange={(e) => setEmergencyType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold"
              >
                <option value="Cardiac / Chest Pain">Cardiac / Severe Chest Pain</option>
                <option value="Road Accident / Severe Trauma">Road Accident / Severe Trauma</option>
                <option value="3rd Trimester Labor Emergency">3rd Trimester Labor Emergency (Janani)</option>
                <option value="Snake Bite / Poisoning">Snake Bite / Poisoning</option>
                <option value="Severe Respiratory Distress">Severe Respiratory Distress / Asthma</option>
                <option value="Stroke / Unconscious">Stroke / Loss of Consciousness</option>
              </select>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 space-y-1 text-slate-700 dark:text-slate-300">
              <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Broadcast Location
              </span>
              <p className="text-[11px] text-slate-500">
                Your live GPS coordinates will be instantly transmitted to the nearest 108 Emergency Ambulance base.
              </p>
            </div>

            <button
              onClick={handleTriggerSOS}
              disabled={isDispatching}
              className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Ambulance className="w-5 h-5" />
              <span>{isDispatching ? 'Transmitting Distress Signal...' : 'CONFIRM & DISPATCH 108 AMBULANCE NOW'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs transition-colors cursor-pointer text-center"
            >
              Cancel & Close Window
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
