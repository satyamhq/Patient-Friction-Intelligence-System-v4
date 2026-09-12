import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import { Hospital } from '../../types';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { Building2, Save, CheckCircle2, Phone, MapPin, Bed, Clock } from 'lucide-react';

export const HospitalProfile: React.FC = () => {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [totalBeds, setTotalBeds] = useState(300);
  const [availableBeds, setAvailableBeds] = useState(45);
  const [emergencyAvailable, setEmergencyAvailable] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await hospitalService.getMyProfile();
        if (res.success && res.hospital) {
          const h = res.hospital;
          setHospital(h);
          setName(h.name);
          setTagline(h.tagline || '');
          setAddress(h.address);
          setCity(h.city);
          setState(h.state);
          setPincode(h.pincode);
          setPhone(h.phone);
          setEmergencyPhone(h.emergencyPhone || '');
          setWorkingHours(h.workingHours);
          setTotalBeds(h.totalBeds);
          setAvailableBeds(h.availableBeds);
          setEmergencyAvailable(h.emergencyAvailable);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setError(null);

    try {
      const res = await hospitalService.updateMyProfile({
        name,
        tagline,
        address,
        city,
        state,
        pincode,
        phone,
        emergencyPhone,
        workingHours,
        totalBeds,
        availableBeds,
        emergencyAvailable,
      });

      if (res.success) {
        setSuccessMsg('Hospital facility details updated successfully.');
        setHospital(res.hospital);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Building2 className="w-6 h-6 text-brand-500" />
          Hospital Facility Profile & Settings
        </h2>
        <p className="text-xs text-slate-500">
          Update operational hours, emergency triage contacts, and bed capacity for live discovery
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Facility Metadata & Contacts
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Hospital Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Tagline / Accreditation"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. 1500-Bed Tertiary Care Medical College"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="General Enquiry Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4" />}
              required
            />

            <Input
              label="24/7 Emergency Helpline Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              icon={<Phone className="w-4 h-4 text-rose-500" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Operating Timings"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              icon={<Clock className="w-4 h-4" />}
              required
            />

            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 w-full">
                <input
                  type="checkbox"
                  checked={emergencyAvailable}
                  onChange={(e) => setEmergencyAvailable(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
                <span>🚨 24/7 Emergency Ward Active</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Bed Capacity"
              type="number"
              value={totalBeds}
              onChange={(e) => setTotalBeds(parseInt(e.target.value, 10))}
              icon={<Bed className="w-4 h-4" />}
              required
            />

            <Input
              label="Available / Vacant Beds Today"
              type="number"
              value={availableBeds}
              onChange={(e) => setAvailableBeds(parseInt(e.target.value, 10))}
              icon={<Bed className="w-4 h-4 text-teal-600" />}
              required
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
            Address & Geo-Spatial Location
          </h3>

          <Input
            label="Street Address / Area"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon={<MapPin className="w-4 h-4" />}
            required
          />

          <div className="grid grid-cols-3 gap-4">
            <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} required />
            <Input label="State" value={state} onChange={(e) => setState(e.target.value)} required />
            <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="lg" isLoading={isSaving} icon={<Save className="w-4 h-4" />}>
            Save Hospital Profile
          </Button>
        </div>
      </form>
    </div>
  );
};
