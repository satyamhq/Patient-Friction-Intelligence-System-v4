import React, { useState, useEffect } from 'react';
import { ashaService, AshaProfile } from '../../services/ashaService';
import { useToast } from '../../context/ToastContext';
import { useTranslation } from 'react-i18next';
import {
  Settings,
  User,
  Globe,
  Database,
  Phone,
  Save,
  Shield,
  MapPin,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const AshaSettings: React.FC = () => {
  const { showToast } = useToast();
  const { i18n } = useTranslation();
  const [profile, setProfile] = useState<AshaProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Editable fields
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('');
  const [subCentre, setSubCentre] = useState('');
  const [phc, setPhc] = useState('');
  const [block, setBlock] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [assignedArea, setAssignedArea] = useState('');
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorPhone, setSupervisorPhone] = useState('');

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await ashaService.getProfile();
      if (res.success) {
        setProfile(res.profile);
        setPhone(res.profile.phone || '+91 98765 33445');
        setVillage(res.profile.village || 'Rampur Kalan');
        setSubCentre(res.profile.sub_centre || 'Rampur Sub-Centre');
        setPhc(res.profile.phc || 'Phagwara Rural PHC');
        setBlock(res.profile.block || 'Phagwara');
        setDistrict(res.profile.district || 'Kapurthala');
        setState(res.profile.state || 'Punjab');
        setAssignedArea(res.profile.assigned_area || 'Ward 4 & 5 (Households HH-01 to HH-15)');
        setSupervisorName(res.profile.supervisor_name || 'Sister Nirmal Kaur (ANM)');
        setSupervisorPhone(res.profile.supervisor_phone || '+91 98765 11223');
      }
    } catch {
      showToast('Failed to load profile settings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await ashaService.updateProfile({
        phone,
        village,
        sub_centre: subCentre,
        phc,
        block,
        district,
        state,
        assigned_area: assignedArea,
        supervisor_name: supervisorName,
        supervisor_phone: supervisorPhone,
      });

      if (res.success) {
        showToast('Worker profile and administrative hierarchy updated.', 'success');
        await loadProfile();
      }
    } catch {
      showToast('Failed to update profile.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    showToast(`Language switched to ${lng.toUpperCase()}`, 'info');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" />
          <span>Frontline Worker Configuration</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">
          Settings, Worker Profile & Language
        </h1>
        <p className="text-xs text-slate-500">
          Manage worker identity, assigned administrative hierarchy, offline local storage, and vernacular language preferences
        </p>
      </div>

      {/* Language Selector Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <Globe className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Preferred Language (भाषा / ਬੋਲੀ)
            </h3>
            <p className="text-xs text-slate-500">Select language for field interfaces and SMS templates</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'en', label: 'English', sub: 'Default' },
            { id: 'pa', label: 'ਪੰਜਾਬੀ', sub: 'Punjabi (Official)' },
            { id: 'hi', label: 'हिन्दी', sub: 'Hindi' },
            { id: 'mr', label: 'मराठी', sub: 'Marathi' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                i18n.language === lang.id
                  ? 'border-teal-500 bg-teal-50 text-teal-900 font-bold shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="block text-sm font-bold">{lang.label}</span>
              <span className="text-[10px] text-slate-400">{lang.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 text-xs">
        <div className="flex items-center gap-2.5">
          <User className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              ASHA Administrative Profile
            </h3>
            <p className="text-xs text-slate-500">Worker ID: <strong>{profile?.asha_code || 'ASHA-PB-KPT-104'}</strong></p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Official Full Name</label>
            <input
              type="text"
              value={profile?.name || 'Kavita Devi'}
              disabled
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl font-semibold text-slate-500"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Worker Mobile Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Assigned Village</label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Sub-centre</label>
            <input
              type="text"
              value={subCentre}
              onChange={(e) => setSubCentre(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Health Centre (PHC)</label>
            <input
              type="text"
              value={phc}
              onChange={(e) => setPhc(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Block</label>
            <input
              type="text"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ANM Supervisor Name</label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 mb-1">Supervisor Phone</label>
            <input
              type="text"
              value={supervisorPhone}
              onChange={(e) => setSupervisorPhone(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-sm flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
