import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { documentService } from '../../services/documentService';
import { requestService } from '../../services/requestService';
import { useLocation } from '../../context/LocationContext';
import { Hospital, HospitalDepartment, PatientDocument } from '../../types';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConsentModal } from '../../components/patient/ConsentModal';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import {
  Building2,
  MapPin,
  Phone,
  Clock,
  Bed,
  ShieldCheck,
  Calendar,
  Send,
  FileText,
  CheckCircle2,
  Languages,
  ExternalLink,
  Layers,
} from 'lucide-react';

export const HospitalDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { coords } = useLocation();
  const navigate = useNavigate();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [departments, setDepartments] = useState<HospitalDepartment[]>([]);
  const [patientDocs, setPatientDocs] = useState<PatientDocument[]>([]);

  // Request form state
  const [selectedDept, setSelectedDept] = useState<string>('');
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [preferredDate, setPreferredDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<string>(
    'Morning (09:00 AM - 12:00 PM)'
  );
  const [additionalMessage, setAdditionalMessage] = useState<string>('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [needsAmbulance, setNeedsAmbulance] = useState<boolean>(false);
  const [needsCareEscort, setNeedsCareEscort] = useState<boolean>(false);
  const [pickupAddress, setPickupAddress] = useState<string>('');

  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await hospitalService.getById(id, {
          lat: coords.latitude,
          lng: coords.longitude,
        });
        if (res.success) {
          setHospital(res.hospital);
          setDepartments(res.departments || []);
          if (res.departments && res.departments.length > 0) {
            setSelectedDept(res.departments[0].name);
          }
        }

        const dRes = await documentService.getPatientDocuments();
        if (dRes.success) {
          setPatientDocs(dRes.documents || []);
        }
      } catch (e) {
        console.error('[HospitalDetails Error]', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadDetails();
  }, [id, coords.latitude, coords.longitude]);

  const handleOpenConsent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept || !reasonForVisit || !preferredDate) {
      setFormError('Please select a department, state your reason for visit, and pick a preferred date.');
      return;
    }
    setFormError(null);
    setIsConsentModalOpen(true);
  };

  const handleConfirmConsentAndSubmit = async (dataShared: string[]) => {
    if (!hospital || !id) return;
    setIsSubmitting(true);

    try {
      const res = await requestService.createRequest({
        hospitalId: id,
        departmentName: selectedDept,
        reasonForVisit,
        preferredDate,
        preferredTimeSlot,
        additionalMessage,
        documentIds: selectedDocIds,
        dataShared,
        consentAgreed: true,
        needsAmbulance,
        needsCareEscort,
        pickupAddress,
      });

      if (res.success) {
        setIsConsentModalOpen(false);
        navigate(`/patient/requests/${res.request._id}`);
      }
    } catch (e: any) {
      setFormError(e.response?.data?.message || 'Failed to submit patient intake request.');
      setIsConsentModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDocSelect = (docId: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
    );
  };

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (!hospital) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <h3 className="font-bold text-slate-800">Hospital Facility Not Found</h3>
        <Link to="/patient/hospitals" className="mt-4 inline-block">
          <Button variant="primary" size="sm">
            Back to Hospital Finder
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Hospital Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200 uppercase">
                {hospital.type} Facility
              </span>
              {hospital.emergencyAvailable && (
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  🚨 24/7 Emergency Active
                </span>
              )}
              <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                100% Verified Profile Details
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {hospital.name}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-500" />
              <span>{hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</span>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
            <a
              href={`tel:${hospital.phone}`}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{hospital.phone}</span>
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Turn-by-Turn Navigation</span>
            </a>
          </div>
        </div>

        {/* Operational Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Working Timings</span>
            <p className="font-bold text-slate-800 truncate">{hospital.workingHours}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Bed Availability</span>
            <p className="font-bold text-slate-800">{hospital.availableBeds} / {hospital.totalBeds} Beds Vacant</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Average OPD Wait</span>
            <p className="font-bold text-slate-800">~{hospital.averageWaitTimeMinutes} Minutes</p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-0.5">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Supported Languages</span>
            <p className="font-bold text-slate-800 truncate">
              {(Array.isArray(hospital.languagesSupported)
                ? hospital.languagesSupported
                : ['Hindi', 'Punjabi', 'English']
              ).join(', ')}
            </p>
          </div>
        </div>

        {/* Diagnostic Facilities Tags */}
        <div className="space-y-1.5 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Diagnostic Facilities</h4>
          <div className="flex flex-wrap gap-1.5">
            {(Array.isArray(hospital.diagnosticFacilities)
              ? hospital.diagnosticFacilities
              : ['24/7 Emergency Triage', 'Digital X-Ray', 'Pathology Lab', 'ECG', 'Ultrasound']
            ).map((fac, i) => (
              <span key={i} className="text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded-lg font-medium">
                ✓ {fac}
              </span>
            ))}
          </div>
        </div>

        {/* All Treated Illnesses & Conditions Banner */}
        {hospital.allTreatedConditions && hospital.allTreatedConditions.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <span>🩺</span> बीमारियों का इलाज (Illnesses & Diseases Treated):
              </h4>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {hospital.allTreatedConditions.length} Conditions Covered
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hospital.allTreatedConditions.map((condition, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium shadow-2xs"
                >
                  ✓ {condition}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Departments Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" /> Available OPD Departments & Specialist Doctors
          </h3>
          <span className="text-xs text-slate-500">{departments.length} Active Departments</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div
              key={dept._id}
              onClick={() => setSelectedDept(dept.name)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedDept === dept.name
                  ? 'bg-teal-50/70 border-teal-400 ring-2 ring-teal-500/20 shadow-sm'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-slate-900">{dept.name}</h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {dept.consultationFee === 0 ? 'FREE OPD' : `₹${dept.consultationFee}`}
                </span>
              </div>

              {dept.headDoctorName && (
                <p className="text-xs text-teal-800 font-bold flex items-center gap-1">
                  <span>👨‍⚕️ Specialist:</span> {dept.headDoctorName}
                </p>
              )}

              <p className="text-[11px] text-slate-500 line-clamp-2">{dept.description}</p>

              {/* Treated Conditions for this Department */}
              {dept.treatedConditions && dept.treatedConditions.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    🩺 Bimariyon ka Ilaaj:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {dept.treatedConditions.slice(0, 4).map((cond, cIdx) => (
                      <span
                        key={cIdx}
                        className="text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-200/60 font-medium"
                      >
                        ✓ {cond}
                      </span>
                    ))}
                    {dept.treatedConditions.length > 4 && (
                      <span className="text-[10px] text-emerald-600 font-bold px-1">
                        +{dept.treatedConditions.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-100">
                <span>Timings: {dept.opdTimings}</span>
                <span className="font-bold text-teal-700 bg-teal-100/70 px-1.5 py-0.5 rounded">
                  {dept.availableTokensToday} / {dept.dailyTokenCapacity || 50} Seats Today
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Patient Intake Request Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Send className="w-5 h-5 text-brand-500" /> Send Patient Intake Request
          </h3>
          <p className="text-xs text-slate-500">
            Transmit non-clinical context and clinical symptoms with full verified consent
          </p>
        </div>

        {formError && <ErrorAlert message={formError} onDismiss={() => setFormError(null)} />}

        <form onSubmit={handleOpenConsent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Selected Clinical Department"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              options={departments.map((d) => ({ label: `${d.name} (Fee: ₹${d.consultationFee})`, value: d.name }))}
              required
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Preferred Visit Date"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
              />

              <Select
                label="Time Window"
                value={preferredTimeSlot}
                onChange={(e) => setPreferredTimeSlot(e.target.value)}
                options={[
                  { label: 'Morning (09:00 AM - 12:00 PM)', value: 'Morning (09:00 AM - 12:00 PM)' },
                  { label: 'Afternoon (12:00 PM - 03:00 PM)', value: 'Afternoon (12:00 PM - 03:00 PM)' },
                  { label: 'Evening (03:00 PM - 06:00 PM)', value: 'Evening (03:00 PM - 06:00 PM)' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Reason for Visit & Primary Symptoms
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              rows={3}
              placeholder="e.g. Chronic chest tightness upon exertion for 3 weeks, previously diagnosed with hypertension."
              value={reasonForVisit}
              onChange={(e) => setReasonForVisit(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Additional Accessibility Accommodation Requests (Optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              rows={2}
              placeholder="e.g. Traveling from 40km village by rural bus. Requesting wheelchair assistance at entry and early morning token."
              value={additionalMessage}
              onChange={(e) => setAdditionalMessage(e.target.value)}
            />
          </div>

          {/* Hospital Transport & Doorstep Care Escort Assistance Section */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span>🚗</span> Non-Clinical Transport & Care-Attendant Assistance
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select if you have difficulty traveling to the hospital or need an attendant to accompany you.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option 1: Hospital Ambulance Pickup */}
              <div
                onClick={() => setNeedsAmbulance(!needsAmbulance)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  needsAmbulance
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={needsAmbulance}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      🚑 Request Hospital Ambulance / Van
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-900 text-rose-800 dark:text-rose-200 px-2 py-0.5 rounded-full">
                    {hospital.ambulanceService?.availableAmbulances ?? 2} Avail
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  Hospital ambulance will pick you up directly from your home address and bring you to the hospital OPD.
                </p>
                <div className="pl-6 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>Driver: Gurmeet Singh</span>
                  <span className="text-rose-700 dark:text-rose-300 font-bold">ETA: ~{hospital.ambulanceService?.avgEtaMins ?? 18} mins</span>
                </div>
              </div>

              {/* Option 2: Doorstep Care-Attendant Escort */}
              <div
                onClick={() => setNeedsCareEscort(!needsCareEscort)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  needsCareEscort
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={needsCareEscort}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      🤝 Request Doorstep Care Escort (Sahayak)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded-full">
                    Home Pick & Drop
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  A certified hospital health attendant will visit your home, escort you safely throughout tests, and drop you back home.
                </p>
                <div className="pl-6 text-[10px] text-slate-500 font-semibold flex items-center justify-between">
                  <span>Escort: Smt. Sunita Sharma</span>
                  <span className="text-emerald-700 dark:text-emerald-300 font-bold">Safe Return Drop</span>
                </div>
              </div>
            </div>

            {(needsAmbulance || needsCareEscort) && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <Input
                  label="Pickup Home Address (Where should ambulance/attendant arrive?)"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  placeholder="Enter complete village / street home address for pickup"
                />
              </div>
            )}
          </div>

          {/* Attach Documents Selection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-slate-700">
                Attach Medical Documents from Your Vault ({selectedDocIds.length} Selected)
              </label>
              <Link to="/patient/documents" className="text-[11px] font-bold text-brand-600 hover:text-brand-700">
                + Upload More Documents
              </Link>
            </div>

            {patientDocs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                No documents found in vault. You can upload prescriptions in the Documents tab.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {patientDocs.map((doc) => {
                  const isChecked = selectedDocIds.includes(doc._id);
                  return (
                    <div
                      key={doc._id}
                      onClick={() => toggleDocSelect(doc._id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-teal-50 border-teal-300 text-teal-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="rounded text-brand-600 w-4 h-4"
                      />
                      <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <div className="truncate flex-1">
                        <p className="truncate">{doc.title}</p>
                        <span className="text-[10px] text-slate-400 font-normal">{doc.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={<ShieldCheck className="w-5 h-5" />}
            >
              Review Consent & Send Request
            </Button>
          </div>
        </form>
      </div>

      {/* Consent Modal Trigger */}
      {hospital && (
        <ConsentModal
          isOpen={isConsentModalOpen}
          onClose={() => setIsConsentModalOpen(false)}
          hospital={hospital}
          departmentName={selectedDept}
          reasonForVisit={reasonForVisit}
          attachedDocsCount={selectedDocIds.length}
          onConfirmConsent={handleConfirmConsentAndSubmit}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};
