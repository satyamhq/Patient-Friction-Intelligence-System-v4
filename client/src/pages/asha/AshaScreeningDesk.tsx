import React, { useState } from 'react';
import {
  Activity,
  HeartPulse,
  Baby,
  Search,
  CheckCircle2,
  AlertTriangle,
  Save,
  PlusCircle,
  FileCheck,
  Stethoscope,
} from 'lucide-react';

export const AshaScreeningDesk: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'cbac' | 'muac' | 'fever'>('cbac');
  const [savedMessage, setSavedMessage] = useState('');

  // CBAC Form State
  const [cbacName, setCbacName] = useState('');
  const [cbacAge, setCbacAge] = useState('45');
  const [cbacSmoke, setCbacSmoke] = useState('no');
  const [cbacAlcohol, setCbacAlcohol] = useState('no');
  const [cbacWaist, setCbacWaist] = useState('normal');
  const [cbacActivity, setCbacActivity] = useState('yes');
  const [cbacFamilyHistory, setCbacFamilyHistory] = useState('no');

  // MUAC Child Form State
  const [muacChildName, setMuacChildName] = useState('');
  const [muacAgeMonths, setMuacAgeMonths] = useState('14');
  const [muacMeasurement, setMuacMeasurement] = useState('13.0');
  const [muacEdema, setMuacEdema] = useState('no');

  // Calculate CBAC Risk Score
  const calculateCbacScore = () => {
    let score = 0;
    const age = parseInt(cbacAge, 10);
    if (age >= 50) score += 2;
    else if (age >= 40) score += 1;
    if (cbacSmoke === 'yes') score += 2;
    if (cbacAlcohol === 'yes') score += 1;
    if (cbacWaist === 'high') score += 2;
    if (cbacActivity === 'no') score += 1;
    if (cbacFamilyHistory === 'yes') score += 2;
    return score;
  };

  const cbacScore = calculateCbacScore();

  const handleSaveCbac = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(`CBAC Record for ${cbacName || 'Citizen'} saved. Risk Score: ${cbacScore}/10 (${cbacScore >= 4 ? 'High Risk - Refer to PHC' : 'Low Risk - Annual Screen'})`);
    setCbacName('');
    setTimeout(() => setSavedMessage(''), 5000);
  };

  const handleSaveMuac = (e: React.FormEvent) => {
    e.preventDefault();
    const mm = parseFloat(muacMeasurement);
    const isSam = mm < 11.5 || muacEdema === 'yes';
    setSavedMessage(`Child Nutrition Log for ${muacChildName || 'Infant'} saved: ${isSam ? 'RED (Severe Acute Malnutrition - Refer to NRC)' : 'GREEN/YELLOW (Normal Nutrition)'}`);
    setMuacChildName('');
    setTimeout(() => setSavedMessage(''), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-2">
              <Activity className="w-3.5 h-3.5" />
              <span>Frontline Diagnostic Toolkit</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Community Health Screening Desk
            </h1>
            <p className="text-teal-100/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Conduct field screenings for Adult Non-Communicable Diseases (CBAC Checklist), Child Malnutrition (MUAC Tape), and Village Fever Surveys.
            </p>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Screening Mode Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('cbac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cbac'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          CBAC Form (Adults 30+ NCD Risk)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('muac')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'muac'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Child MUAC (SAM Malnutrition)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('fever')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'fever'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Fever & Vector Surveillance
        </button>
      </div>

      {/* 1. CBAC Screening Form */}
      {activeTab === 'cbac' && (
        <form onSubmit={handleSaveCbac} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="font-extrabold text-base text-slate-900">
                Community Based Assessment Checklist (CBAC)
              </h2>
              <p className="text-xs text-slate-500">Screening adults aged 30+ for Hypertension, Diabetes & Cancers</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block">CURRENT SCORE</span>
              <span className={`text-xl font-black ${cbacScore >= 4 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {cbacScore} / 10
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Citizen Full Name *</label>
              <input
                type="text"
                required
                value={cbacName}
                onChange={(e) => setCbacName(e.target.value)}
                placeholder="e.g. Ram Prasad"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Age in Years</label>
              <input
                type="number"
                value={cbacAge}
                onChange={(e) => setCbacAge(e.target.value)}
                min="30"
                max="100"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Do they smoke or chew tobacco / gutkha?</label>
              <select
                value={cbacSmoke}
                onChange={(e) => setCbacSmoke(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              >
                <option value="no">No (0 pts)</option>
                <option value="yes">Yes (Daily or occasional) (+2 pts)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Do they consume alcohol?</label>
              <select
                value={cbacAlcohol}
                onChange={(e) => setCbacAlcohol(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              >
                <option value="no">No (0 pts)</option>
                <option value="yes">Yes (+1 pt)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Waist Circumference</label>
              <select
                value={cbacWaist}
                onChange={(e) => setCbacWaist(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              >
                <option value="normal">Normal (Men &lt; 90cm, Women &lt; 80cm) (0 pts)</option>
                <option value="high">High (Men &ge; 90cm, Women &ge; 80cm) (+2 pts)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Physical Activity (&ge;150 mins/week)</label>
              <select
                value={cbacActivity}
                onChange={(e) => setCbacActivity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              >
                <option value="yes">Yes, physically active (0 pts)</option>
                <option value="no">No, sedentary lifestyle (+1 pt)</option>
              </select>
            </div>
          </div>

          {cbacScore >= 4 ? (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <span className="font-black block">HIGH RISK CITIZEN (Score &ge; 4)</span>
                <span>Refer to nearest Ayushman Arogya Mandir / PHC for BP and Blood Sugar measurement.</span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Low risk score (&lt; 4). Schedule routine annual community checkup.</span>
            </div>
          )}

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Save CBAC Record
            </button>
          </div>
        </form>
      )}

      {/* 2. MUAC Malnutrition Screening */}
      {activeTab === 'muac' && (
        <form onSubmit={handleSaveMuac} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="font-extrabold text-base text-slate-900">Child MUAC Malnutrition Assessment</h2>
            <p className="text-xs text-slate-500">Screening infants 6-59 months using Mid-Upper Arm Circumference tape</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Child Name *</label>
              <input
                type="text"
                required
                value={muacChildName}
                onChange={(e) => setMuacChildName(e.target.value)}
                placeholder="e.g. Master Aarav"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Age in Months</label>
              <input
                type="number"
                value={muacAgeMonths}
                onChange={(e) => setMuacAgeMonths(e.target.value)}
                min="6"
                max="59"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">MUAC Reading (Centimetres)</label>
              <input
                type="number"
                step="0.1"
                value={muacMeasurement}
                onChange={(e) => setMuacMeasurement(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-base"
              />
              <div className="mt-2 flex items-center gap-2 text-[11px] font-bold">
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">&gt; 12.5cm: Green</span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800">11.5 - 12.5cm: Yellow</span>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800">&lt; 11.5cm: Red (SAM)</span>
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Bilateral Pitting Edema in Feet?</label>
              <select
                value={muacEdema}
                onChange={(e) => setMuacEdema(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold"
              >
                <option value="no">No Edema</option>
                <option value="yes">Yes (Immediate SAM Referral to NRC)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Log Child MUAC
            </button>
          </div>
        </form>
      )}

      {/* 3. Fever & Vector Surveillance */}
      {activeTab === 'fever' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-4 text-xs">
          <h2 className="font-extrabold text-base text-slate-900">Village Fever & Vector Survey Protocol</h2>
          <p className="text-slate-600 leading-relaxed">
            Every household visited with an active fever case must be logged. Perform bivalent Rapid Diagnostic Test (RDT) for Malaria if fever duration is &gt; 24 hours with chills.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-bold text-slate-900">Active Surveillance Protocol:</div>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              <li>Check water storage coolers and overhead tanks for mosquito breeding (Aedes).</li>
              <li>Encourage observance of weekly "Dry Day" in every household.</li>
              <li>Provide oral Paracetamol and ORS; refer persistent fever to PHC laboratory.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
