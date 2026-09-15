import React, { useState, useEffect } from 'react';
import { doctorService } from '../../services/doctorService';
import { useToast } from '../../context/ToastContext';
import { CalendarDays, Save, Video, Sun, Moon, Coffee } from 'lucide-react';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const parseMaybeJson = (val: any, fallback: any) => {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

export const DoctorSchedule: React.FC = () => {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving]   = useState(false);
  const [isDemo, setIsDemo]       = useState(false);

  const [workingDays, setWorkingDays]         = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [opdStart, setOpdStart]               = useState('09:00');
  const [opdEnd, setOpdEnd]                   = useState('17:00');
  const [breakStart, setBreakStart]           = useState('13:00');
  const [breakEnd, setBreakEnd]               = useState('14:00');
  const [slotDuration, setSlotDuration]       = useState(15);
  const [maxPatients, setMaxPatients]         = useState(30);
  const [teleconsultAvail, setTeleconsultAvail]   = useState(true);
  const [teleconsultDays, setTeleconsultDays] = useState<string[]>(['Tuesday', 'Thursday']);
  const [teleconsultStart, setTeleconsultStart] = useState('17:00');
  const [teleconsultEnd, setTeleconsultEnd]   = useState('18:00');

  const load = async () => {
    try {
      const res = await doctorService.getSchedule();
      const s = res.data.schedule;
      if (s) {
        setWorkingDays(parseMaybeJson(s.workingDays, ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']));
        setOpdStart(s.opdStart || '09:00');
        setOpdEnd(s.opdEnd || '17:00');
        setBreakStart(s.breakStart || '13:00');
        setBreakEnd(s.breakEnd || '14:00');
        setSlotDuration(s.slotDurationMinutes || 15);
        setMaxPatients(s.maxPatientsPerDay || 30);
        setTeleconsultAvail(s.teleconsultAvailable ?? true);
        setTeleconsultDays(parseMaybeJson(s.teleconsultDays, ['Tuesday', 'Thursday']));
        setTeleconsultStart(s.teleconsultStart || '17:00');
        setTeleconsultEnd(s.teleconsultEnd || '18:00');
        setIsDemo(s.isDemo || false);
      }
    } catch { /* use defaults */ }
    finally { setIsLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleDay = (day: string, setter: React.Dispatch<React.SetStateAction<string[]>>, arr: string[]) =>
    setter(arr.includes(day) ? arr.filter(d => d !== day) : [...arr, day]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await doctorService.updateSchedule({
        workingDays, opdStart, opdEnd, breakStart, breakEnd,
        slotDurationMinutes: slotDuration, maxPatientsPerDay: maxPatients,
        teleconsultAvailable: teleconsultAvail, teleconsultDays,
        teleconsultStart, teleconsultEnd,
      });
      showToast('Schedule & availability updated!', 'success');
      setIsDemo(false);
    } catch { showToast('Failed to save schedule.', 'error'); }
    finally { setIsSaving(false); }
  };

  if (isLoading) return <div className="py-20 text-center text-slate-400">Loading schedule…</div>;

  // Calculate approximate slot count
  const toMin = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const totalOpdMin = Math.max(0, toMin(opdEnd) - toMin(opdStart) - (toMin(breakEnd) - toMin(breakStart)));
  const estimatedSlots = Math.floor(totalOpdMin / slotDuration);

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-teal-600" /> Schedule & Availability
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Configure your OPD hours, slot duration, and teleconsultation windows.</p>
        </div>
        {isDemo && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200 self-start">DEMO DEFAULTS</span>}
      </div>

      {/* Capacity Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'OPD Hours', value: `${opdStart} – ${opdEnd}`, icon: <Sun className="w-4 h-4 text-amber-500" /> },
          { label: 'Est. Slots / Day', value: estimatedSlots, icon: <CalendarDays className="w-4 h-4 text-teal-500" /> },
          { label: 'Max Patients', value: maxPatients, icon: <Coffee className="w-4 h-4 text-indigo-500" /> },
        ].map((item, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">{item.icon}</div>
            <div>
              <p className="text-lg font-black text-slate-900">{item.value}</p>
              <p className="text-[11px] text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Working Days */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Sun className="w-4 h-4 text-amber-500" /> Working Days
        </h3>
        <div className="flex flex-wrap gap-2">
          {ALL_DAYS.map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day, setWorkingDays, workingDays)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                workingDays.includes(day)
                  ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                  : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-teal-300'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* OPD Timings */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-teal-500" /> OPD Timings & Slots
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'OPD Start', value: opdStart, setter: setOpdStart },
            { label: 'OPD End',   value: opdEnd,   setter: setOpdEnd },
            { label: 'Break Start', value: breakStart, setter: setBreakStart },
            { label: 'Break End',   value: breakEnd,   setter: setBreakEnd },
          ].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{label}</label>
              <input
                type="time" value={value}
                onChange={e => setter(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Slot Duration (minutes)</label>
            <select value={slotDuration} onChange={e => setSlotDuration(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl">
              {[10, 15, 20, 30, 45, 60].map(d => <option key={d} value={d}>{d} min</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Max Patients / Day</label>
            <input type="number" value={maxPatients} onChange={e => setMaxPatients(Number(e.target.value))} min={1} max={100}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        </div>
      </div>

      {/* Teleconsultation */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Video className="w-4 h-4 text-blue-500" /> Teleconsultation Availability
          </h3>
          <button
            onClick={() => setTeleconsultAvail(v => !v)}
            className={`relative w-11 h-6 rounded-full transition-colors ${teleconsultAvail ? 'bg-teal-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${teleconsultAvail ? 'left-5.5 left-[22px]' : 'left-0.5'}`} />
          </button>
        </div>

        {teleconsultAvail && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Teleconsult Days</label>
              <div className="flex flex-wrap gap-2">
                {ALL_DAYS.map(day => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day, setTeleconsultDays, teleconsultDays)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      teleconsultDays.includes(day)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Start Time</label>
                <input type="time" value={teleconsultStart} onChange={e => setTeleconsultStart(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">End Time</label>
                <input type="time" value={teleconsultEnd} onChange={e => setTeleconsultEnd(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-3 text-sm font-extrabold text-white bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-lg shadow-teal-600/25 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving…' : 'Save Schedule & Availability'}
        </button>
      </div>
    </div>
  );
};
