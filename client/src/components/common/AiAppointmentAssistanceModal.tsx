import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import {
  Phone,
  Mic,
  MicOff,
  AlertTriangle,
  Ambulance,
  CheckCircle2,
  Calendar,
  Clock,
  Building2,
  User,
  ShieldCheck,
  X,
  Sparkles,
  Info,
  Loader2,
  ArrowRight,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { appointmentVoiceService } from '../../services/appointmentVoiceService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpen108Emergency?: () => void;
  initialHospitalName?: string;
  initialDepartment?: string;
}

export const AiAppointmentAssistanceModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpen108Emergency,
  initialHospitalName,
  initialDepartment,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [micPermissionState, setMicPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('checking');
  const [isMicRequesting, setIsMicRequesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'quick_booking' | 'guidelines'>('voice');

  // Booking Form State
  const [patientName, setPatientName] = useState(user?.name || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '');
  const [hospitalName, setHospitalName] = useState(initialHospitalName || 'District Civil Hospital');
  const [department, setDepartment] = useState(initialDepartment || 'General Medicine');
  const [preferredDate, setPreferredDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [preferredTime, setPreferredTime] = useState('10:30 AM');
  const [reason, setReason] = useState('');
  const [isBooking, setIsBooking] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null);

  // Call session tracking
  const callStartTimeRef = useRef<number>(Date.now());
  const convIdRef = useRef<string>(`conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`);

  // Dynamically load the official ElevenLabs Conversational AI embed script once
  useEffect(() => {
    if (!isOpen) return;

    const SCRIPT_SRC = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    const existingScript = document.querySelector(`script[src="${SCRIPT_SRC}"]`);

    if (existingScript) {
      setScriptLoaded(true);
    } else {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.type = 'text/javascript';
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => {
        console.error('[ElevenLabs] Failed to load widget script');
        showToast('Could not load voice service. Please check your network connection.', 'error');
      };
      document.body.appendChild(script);
    }

    // Reset session timer
    callStartTimeRef.current = Date.now();
    convIdRef.current = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Log call initiation
    appointmentVoiceService
      .logCall({
        conversationId: convIdRef.current,
        patientId: user?.id,
        callStatus: 'initiated',
        callOutcome: 'hospital_info_provided',
      })
      .catch(() => {});
  }, [isOpen, user?.id]);

  // Check microphone permissions
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' as PermissionName })
        .then((res) => {
          setMicPermissionState(res.state as any);
          res.onchange = () => {
            setMicPermissionState(res.state as any);
          };
        })
        .catch(() => {
          setMicPermissionState('prompt');
        });
    } else {
      setMicPermissionState('prompt');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestMic = async () => {
    try {
      setIsMicRequesting(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the test stream immediately once granted
      stream.getTracks().forEach((track) => track.stop());
      setMicPermissionState('granted');
      showToast('Microphone access granted. You can now talk to the AI Assistant.', 'success');
    } catch (err: any) {
      console.warn('[Microphone] Access denied or unavailable', err);
      setMicPermissionState('denied');
      showToast('Microphone permission was denied. You can still use the interactive appointment booking tab.', 'warning');
    } finally {
      setIsMicRequesting(false);
    }
  };

  const handleCloseModal = () => {
    const duration = Math.round((Date.now() - callStartTimeRef.current) / 1000);
    // Log completion
    appointmentVoiceService
      .logCall({
        conversationId: convIdRef.current,
        patientId: user?.id,
        callStatus: 'completed',
        callOutcome: confirmedBooking ? 'appointment_booked' : 'user_ended',
        durationSeconds: duration,
      })
      .catch(() => {});

    onClose();
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !department || !preferredDate || !preferredTime) {
      showToast('Please fill out all required appointment fields.', 'warning');
      return;
    }

    try {
      setIsBooking(true);
      const res = await appointmentVoiceService.bookAppointment({
        patientId: user?.id,
        patientName: patientName.trim(),
        patientPhone: patientPhone.trim(),
        hospitalName: hospitalName.trim(),
        department: department.trim(),
        preferredDate,
        preferredTime,
        reason: reason.trim() || 'Booked via AI Healthcare Assistant',
        operationalNotes: 'Patient confirmed appointment details in interactive assistance desk',
      });

      if (res.success && res.appointment) {
        setConfirmedBooking(res.appointment);
        showToast('Appointment successfully confirmed and registered!', 'success');
      } else {
        throw new Error(res.message || 'Unable to book appointment');
      }
    } catch (err: any) {
      showToast(err.message || 'Booking submission failed. Please retry.', 'error');
    } finally {
      setIsBooking(false);
    }
  };

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
      className="fixed inset-0 z-[99999] overflow-y-auto p-3 sm:p-6 flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-assistance-title"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-teal-500/40 w-full max-w-2xl p-5 sm:p-7 shadow-2xl space-y-4 relative my-auto max-h-[94vh] overflow-y-auto shrink-0">
        {/* Subtle Top Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-500 rounded-t-2xl sm:rounded-t-3xl" />

        {/* Header with Non-Clinical Boundary Badge */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shrink-0 shadow-xs">
              <Phone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  AI Healthcare Assistant
                </span>
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline-block">
                  Non-Clinical Navigation
                </span>
              </div>
              <h2 id="ai-assistance-title" className="text-lg sm:text-xl font-black text-slate-900 mt-1">
                AI Call & Appointment Assistance
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Close modal"
            className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Explicit Emergency & Non-Clinical Boundary Alert */}
        <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Important Notice:</span> This AI assistant provides non-clinical administrative guidance for booking, rescheduling, and facility navigation only. It is not a doctor and does not provide medical diagnosis or treatment.
            </div>
          </div>
          {onOpen108Emergency && (
            <button
              type="button"
              onClick={() => {
                handleCloseModal();
                onOpen108Emergency();
              }}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-black shrink-0 flex items-center gap-1.5 shadow-xs cursor-pointer select-none transition-all"
            >
              <Ambulance className="w-3.5 h-3.5" />
              <span>108 Emergency</span>
            </button>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'voice'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Live Voice Conversation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quick_booking')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quick_booking'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Appointment Confirmation</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('guidelines')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'guidelines'
                ? 'border-teal-600 text-teal-700 font-extrabold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Checklist & Guidance</span>
          </button>
        </div>

        {/* TAB 1: ELEVENLABS CONVERSATIONAL AI VOICE AGENT */}
        {activeTab === 'voice' && (
          <div className="space-y-4">
            {/* Assistant Greeting Card */}
            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 text-slate-800 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                  Healthcare Appointment Assistant Ready
                </span>
              </div>
              <p className="text-sm font-medium italic text-slate-700">
                "Hello, I'm your healthcare appointment assistant. I can help you find, book, reschedule, or cancel an appointment, check hospital guidelines, or understand required paperwork. How can I help you today?"
              </p>
            </div>

            {/* Microphone Permission Status & Control */}
            {micPermissionState === 'denied' && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <MicOff className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Microphone access is blocked in your browser:</span> To speak with the AI assistant, click the lock/settings icon in your browser URL bar and allow microphone access, then refresh or click the "Appointment Confirmation" tab to book textually.
                </div>
              </div>
            )}

            {micPermissionState === 'prompt' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Microphone permission is required for real-time speech conversation.</span>
                </div>
                <button
                  type="button"
                  onClick={handleRequestMic}
                  disabled={isMicRequesting}
                  className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isMicRequesting ? 'Checking...' : 'Enable Microphone'}
                </button>
              </div>
            )}

            {/* ElevenLabs Conversational Web Widget */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-inner min-h-[220px]">
              {scriptLoaded ? (
                <div className="flex flex-col items-center gap-3">
                  <elevenlabs-convai agent-id="agent_2901m2hw983kfcesprd47f904gbk"></elevenlabs-convai>
                  <p className="text-xs text-slate-500 text-center max-w-sm mt-2">
                    Click the voice icon to start speaking. The agent will respond verbally with appointment options and facility details.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Loader2 className="w-6 h-6 animate-spin text-teal-600" />
                  <span className="text-xs font-semibold">Connecting to ElevenLabs Voice Agent...</span>
                </div>
              )}
            </div>

            {/* Quick Action Prompt Badges */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Frequently Asked Voice Questions
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Book Cardiology slot tomorrow',
                  'What documents are needed for OPD?',
                  'Find nearest Government Hospital',
                  'Can I reschedule an appointment?',
                  'Check available OPD morning tokens',
                ].map((prompt, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 hover:bg-teal-50 hover:border-teal-200 transition-colors"
                  >
                    💬 "{prompt}"
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: APPOINTMENT CONFIRMATION FORM */}
        {activeTab === 'quick_booking' && (
          <div className="space-y-4">
            {confirmedBooking ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 space-y-3 animate-scale-up">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Confirmed Appointment
                    </span>
                    <h3 className="text-base font-black text-emerald-950">
                      Appointment Confirmed by Hospital System
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200">
                  <div>
                    <span className="text-slate-500 block">Patient Name:</span>
                    <strong className="text-slate-900 text-sm">{confirmedBooking.patientName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contact Phone:</span>
                    <strong className="text-slate-900 text-sm">{confirmedBooking.patientPhone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hospital / Facility:</span>
                    <strong className="text-slate-900 text-sm">{confirmedBooking.hospitalName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Department:</span>
                    <strong className="text-slate-900 text-sm">{confirmedBooking.department}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Date & Time:</span>
                    <strong className="text-emerald-800 text-sm font-extrabold">
                      {confirmedBooking.preferredDate} at {confirmedBooking.preferredTime}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Assisted By:</span>
                    <strong className="text-teal-800 text-sm">{confirmedBooking.assistedBy || 'AI Voice Agent'}</strong>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmedBooking(null)}
                    className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking} className="space-y-3.5">
                <p className="text-xs text-slate-500 leading-relaxed">
                  Enter or verify your required appointment details below. We never claim an appointment is booked until verified and stored in our hospital database.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. Ramesh Kumar"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Patient Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Hospital / Clinic *
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        placeholder="e.g. District Civil Hospital"
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Department / Specialist *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                    >
                      <option value="General Medicine">General Medicine</option>
                      <option value="Cardiology">Cardiology</option>
                      <option value="Orthopedics">Orthopedics</option>
                      <option value="Pediatrics">Pediatrics</option>
                      <option value="Gynecology & Obstetrics">Gynecology & Obstetrics</option>
                      <option value="ENT">ENT</option>
                      <option value="Ophthalmology">Ophthalmology</option>
                      <option value="Dermatology">Dermatology</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="date"
                        required
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Time Slot *
                    </label>
                    <select
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none bg-white"
                    >
                      <option value="09:30 AM">09:30 AM (Morning Slot)</option>
                      <option value="10:30 AM">10:30 AM (Morning Slot)</option>
                      <option value="11:45 AM">11:45 AM (Late Morning Slot)</option>
                      <option value="02:00 PM">02:00 PM (Afternoon Slot)</option>
                      <option value="03:30 PM">03:30 PM (Afternoon Slot)</option>
                      <option value="04:30 PM">04:30 PM (Evening Slot)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reason for Appointment / Non-Clinical Notes
                  </label>
                  <textarea
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Routine follow up check, fever review, joint pain consultation"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none"
                  />
                </div>

                {/* Summary Box */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-700">Appointment Summary:</div>
                  <div className="text-slate-600">
                    Booking for <span className="font-semibold text-slate-900">{patientName || 'Patient'}</span> at <span className="font-semibold text-slate-900">{hospitalName}</span> ({department}) on <span className="font-semibold text-slate-900">{preferredDate} at {preferredTime}</span>.
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isBooking}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isBooking ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Confirming with Hospital...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Appointment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: GUIDELINES & CHECKLIST */}
        {activeTab === 'guidelines' && (
          <div className="space-y-3.5 text-xs text-slate-700 leading-relaxed">
            <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2">
              <h4 className="font-bold text-teal-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                Required Documents Checklist
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>Government Photo Identification: Aadhaar Card, Voter ID, or Driving License.</li>
                <li>ABHA (Ayushman Bharat Health Account) card number if registered.</li>
                <li>Previous hospital OPD slips, discharge summaries, or laboratory reports.</li>
                <li>Active mobile phone to receive token SMS and queue updates.</li>
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-500" />
                What can the AI Voice Assistant do?
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600">
                <div>✔️ Find empanelled hospitals & clinics</div>
                <div>✔️ Department guidance & specialist timings</div>
                <div>✔️ Check OPD token availability</div>
                <div>✔️ Book or reschedule appointments</div>
                <div>✔️ Clarify document & identification rules</div>
                <div>✔️ Barrier assistance (transport & transit links)</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
              <span className="font-bold">Medical Disclaimer:</span> The assistant strictly avoids clinical judgments, medical diagnoses, prescribing medications, or interpreting diagnostic imaging. For sudden emergencies, call <strong>108 (India Emergency Ambulance)</strong> immediately.
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>ElevenLabs Conversational AI • Agent ID: agent_2901m2hw983kfcesprd47f904gbk</span>
          <span className="font-semibold text-teal-700">PFIS Operational Care Hub</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
