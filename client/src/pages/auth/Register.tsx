import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { Input, Select } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import { User, Building2, Mail, Lock, Phone, MapPin, Stethoscope, Leaf, Landmark } from 'lucide-react';

type RoleType = 'patient' | 'hospital' | 'doctor' | 'asha_worker' | 'government';

const ROLES: { id: RoleType; label: string; sublabel: string; icon: React.ReactNode; color: string }[] = [
  { id: 'patient', label: 'Patient', sublabel: 'Access care services', icon: <User className="w-4 h-4" />, color: 'from-teal-500 to-cyan-600' },
  { id: 'hospital', label: 'Hospital', sublabel: 'Manage facility & OPD', icon: <Building2 className="w-4 h-4" />, color: 'from-indigo-500 to-blue-600' },
  { id: 'doctor', label: 'Doctor', sublabel: 'Patient queue & consults', icon: <Stethoscope className="w-4 h-4" />, color: 'from-sky-500 to-teal-600' },
  { id: 'asha_worker', label: 'ASHA Worker', sublabel: 'Field visits & referrals', icon: <Leaf className="w-4 h-4" />, color: 'from-green-500 to-emerald-600' },
  { id: 'government', label: 'Government', sublabel: 'District / state analytics', icon: <Landmark className="w-4 h-4" />, color: 'from-violet-500 to-purple-600' },
];

export const Register: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = (searchParams.get('role') || 'patient') as RoleType;
  const { coords } = useLocation();

  const [role, setRole] = useState<RoleType>(ROLES.find((r) => r.id === initialRole) ? initialRole : 'patient');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Patient fields
  const [age, setAge] = useState(42);
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('female');
  const [preferredLanguage, setPreferredLanguage] = useState('Hindi');
  const [transportAvailability, setTransportAvailability] = useState('low');

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalType, setHospitalType] = useState('Government');

  // Doctor fields
  const [specialization, setSpecialization] = useState('General Medicine');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [qualification, setQualification] = useState('MBBS');

  // ASHA Worker fields
  const [zone, setZone] = useState('Zone A');
  const [district, setDistrict] = useState('');

  // Government fields
  const [department, setDepartment] = useState('National Health Mission');
  const [designation, setDesignation] = useState('District Health Officer');
  const [accessLevel, setAccessLevel] = useState<'district' | 'state' | 'national'>('district');

  const [city, setCity] = useState(coords.city || '');
  const [address, setAddress] = useState(coords.address || '');
  const [state, setState] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const payload: any = {
        name, email, password, role, phone,
        city: city || coords.city || 'Local City',
        address: address || coords.address || '',
        state: state || '',
        latitude: coords.latitude,
        longitude: coords.longitude,
        pincode: coords.pincode || '',
      };

      if (role === 'patient') {
        payload.age = age;
        payload.gender = gender;
        payload.preferredLanguage = preferredLanguage;
        payload.transportAvailability = transportAvailability;
      } else if (role === 'hospital') {
        payload.hospitalName = hospitalName || name;
        payload.type = hospitalType;
      } else if (role === 'doctor') {
        payload.specialization = specialization;
        payload.qualification = qualification;
        payload.licenseNumber = licenseNumber;
      } else if (role === 'asha_worker') {
        payload.zone = zone;
        payload.district = district || city;
      } else if (role === 'government') {
        payload.department = department;
        payload.designation = designation;
        payload.accessLevel = accessLevel;
        payload.district = district || city;
      }

      const res = await register(payload);
      if (res.success) {
        const redirectMap: Record<string, string> = {
          patient: '/patient/dashboard',
          hospital: '/hospital/dashboard',
          doctor: '/doctor/dashboard',
          asha_worker: '/asha/dashboard',
          government: '/government/dashboard',
          admin: '/admin/dashboard',
        };
        navigate(redirectMap[res.user.role] || '/patient/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please check inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedRole = ROLES.find((r) => r.id === role)!;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Create an Account</h2>
        <p className="text-xs text-slate-500">Join the Patient Friction Index & Access Platform</p>
      </div>

      {/* Role Selector: 5 roles */}
      <div className="grid grid-cols-5 gap-1.5 p-1.5 bg-slate-100 rounded-2xl">
        {ROLES.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRole(r.id)}
            className={`flex flex-col items-center justify-center gap-1 py-2.5 px-1 rounded-xl transition-all ${
              role === r.id
                ? `bg-gradient-to-b ${r.color} text-white shadow-md`
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'
            }`}
          >
            {r.icon}
            <span className="text-[9px] font-bold leading-tight text-center">{r.label}</span>
          </button>
        ))}
      </div>

      {/* Role description badge */}
      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${selectedRole.color} text-white text-xs font-semibold`}>
        {selectedRole.icon}
        <span>{selectedRole.label}: {selectedRole.sublabel}</span>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder={role === 'hospital' ? 'e.g. Apollo Hospital Admin' : 'e.g. Sunita Devi'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Hospital name extra field */}
        {role === 'hospital' && (
          <Input
            label="Hospital / Facility Name"
            placeholder="e.g. Apollo Super Speciality Hospital"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            required
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input label="Email Address" type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} required />
          <Input label="Phone Number" type="tel" placeholder="+91 98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} icon={<Phone className="w-4 h-4" />} />
        </div>

        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} icon={<Lock className="w-4 h-4" />} required />

        {/* Patient fields */}
        {role === 'patient' && (
          <>
            <div className="grid grid-cols-3 gap-3">
              <Input label="Age" type="number" value={age} onChange={(e) => setAge(parseInt(e.target.value, 10))} min={1} max={120} required />
              <Select label="Gender" value={gender} onChange={(e) => setGender(e.target.value as any)} options={[{ label: 'Female', value: 'female' }, { label: 'Male', value: 'male' }, { label: 'Other', value: 'other' }]} />
              <Select label="Language" value={preferredLanguage} onChange={(e) => setPreferredLanguage(e.target.value)} options={[{ label: 'Hindi', value: 'Hindi' }, { label: 'English', value: 'English' }, { label: 'Bengali', value: 'Bengali' }, { label: 'Santali', value: 'Santali' }]} />
            </div>
            <Select label="Transportation Availability" value={transportAvailability} onChange={(e) => setTransportAvailability(e.target.value)} options={[{ label: 'None / Irregular Bus (High Barrier)', value: 'none' }, { label: 'Shared Auto / Infrequent Bus', value: 'low' }, { label: 'Regular Public Transit', value: 'moderate' }, { label: 'Personal Vehicle (High Autonomy)', value: 'high' }]} />
          </>
        )}

        {/* Hospital fields */}
        {role === 'hospital' && (
          <Select label="Facility Type" value={hospitalType} onChange={(e) => setHospitalType(e.target.value)} options={[{ label: 'Government', value: 'Government' }, { label: 'Private', value: 'Private' }, { label: 'Trust / NGO', value: 'Trust' }, { label: 'PHC / CHC', value: 'PHC' }]} />
        )}

        {/* Doctor fields */}
        {role === 'doctor' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input label="Specialization" placeholder="e.g. Cardiology" value={specialization} onChange={(e) => setSpecialization(e.target.value)} required />
            <Input label="Qualification" placeholder="e.g. MBBS, MD" value={qualification} onChange={(e) => setQualification(e.target.value)} />
            <Input label="License / MCI Number" placeholder="MCI-XXXXX" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
          </div>
        )}

        {/* ASHA Worker fields */}
        {role === 'asha_worker' && (
          <div className="grid grid-cols-2 gap-3">
            <Input label="Zone" placeholder="e.g. Zone A" value={zone} onChange={(e) => setZone(e.target.value)} required />
            <Input label="District" placeholder="e.g. Phagwara" value={district} onChange={(e) => setDistrict(e.target.value)} required />
          </div>
        )}

        {/* Government fields */}
        {role === 'government' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Department" placeholder="e.g. National Health Mission" value={department} onChange={(e) => setDepartment(e.target.value)} required />
              <Input label="Designation" placeholder="e.g. District Health Officer" value={designation} onChange={(e) => setDesignation(e.target.value)} required />
            </div>
            <Select label="Access Level" value={accessLevel} onChange={(e) => setAccessLevel(e.target.value as any)} options={[{ label: 'District Level', value: 'district' }, { label: 'State Level', value: 'state' }, { label: 'National Level', value: 'national' }]} />
          </>
        )}

        {/* Location */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Address / Area" value={address} onChange={(e) => setAddress(e.target.value)} icon={<MapPin className="w-4 h-4" />} />
          <Input label="City / District" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="State" value={state} onChange={(e) => setState(e.target.value)} />
        </div>

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
          Create {selectedRole.label} Account
        </Button>
      </form>

      <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-brand-600 hover:text-brand-700">Sign In</Link>
      </div>
    </div>
  );
};
