import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ShieldCheck, Lock, CheckSquare, Square, AlertCircle, FileText } from 'lucide-react';
import { Hospital } from '../../types';

export interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospital: Hospital;
  departmentName: string;
  reasonForVisit: string;
  attachedDocsCount: number;
  onConfirmConsent: (consentedFields: string[]) => void;
  isLoading?: boolean;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  hospital,
  departmentName,
  reasonForVisit,
  attachedDocsCount,
  onConfirmConsent,
  isLoading = false,
}) => {
  const [shareDemographics, setShareDemographics] = useState(true);
  const [shareReason, setShareReason] = useState(true);
  const [shareFriction, setShareFriction] = useState(true);
  const [shareDocuments, setShareDocuments] = useState(true);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!agreedToTerms) {
      setValidationError('You must check the consent confirmation box before submitting your request.');
      return;
    }

    const consentedFields: string[] = [];
    if (shareDemographics) consentedFields.push('demographics');
    if (shareReason) consentedFields.push('reason_for_visit');
    if (shareFriction) consentedFields.push('accessibility_friction');
    if (shareDocuments) consentedFields.push('uploaded_documents');

    if (consentedFields.length === 0) {
      setValidationError('Please select at least one data category to share with the triage team.');
      return;
    }

    setValidationError(null);
    onConfirmConsent(consentedFields);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient Data Sharing & Consent Authorization"
      subtitle={`Secure intake authorization for ${hospital.name} (${departmentName})`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Safety & Purpose Card */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3 text-xs text-teal-900 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-teal-950">PFIS Privacy Shield Mandate</p>
            <p>
              Your personal information is strictly protected. Selected data is transmitted exclusively
              to <strong>{hospital.name}</strong> to prepare your OPD token and assess accessibility
              accommodations (e.g. wheelchair, language translator, or transport assistance).
            </p>
          </div>
        </div>

        {/* Selected Intake Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">Target Facility:</span>
            <span className="font-bold text-slate-800">{hospital.name}</span>
          </div>
          <div className="flex justify-between border-b border-slate-200 pb-2">
            <span className="text-slate-500 font-medium">Clinical Department:</span>
            <span className="font-bold text-slate-800">{departmentName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 font-medium">Reason for Visit:</span>
            <span className="font-medium text-slate-700 max-w-xs truncate">{reasonForVisit}</span>
          </div>
        </div>

        {/* Granular Field Sharing Toggles */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Granular Data Sharing Selection
          </h5>

          <div className="space-y-2">
            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={shareDemographics}
                  onChange={(e) => setShareDemographics(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">Demographic & Contact Info</p>
                  <p className="text-[11px] text-slate-500">Patient Code, Age, Gender, Contact Phone</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Recommended</span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={shareReason}
                  onChange={(e) => setShareReason(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">Visit Reason & Symptom Context</p>
                  <p className="text-[11px] text-slate-500">Allows department doctor to pre-triage consultation priority</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">Essential</span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={shareFriction}
                  onChange={(e) => setShareFriction(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">Non-Clinical Accessibility Profile</p>
                  <p className="text-[11px] text-slate-500">
                    Travel distance ({hospital.distanceKm || 25} km), Transport availability, Language preference
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                PFIS Exclusive
              </span>
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50 cursor-pointer transition-colors text-xs">
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={shareDocuments}
                  onChange={(e) => setShareDocuments(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <div>
                  <p className="font-semibold text-slate-900">Attached Medical Documents</p>
                  <p className="text-[11px] text-slate-500">{attachedDocsCount} document(s) attached from your secure vault</p>
                </div>
              </div>
              <FileText className="w-4 h-4 text-slate-400" />
            </label>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Explicit Confirmation Checkbox */}
        <div className="pt-2 border-t border-slate-100">
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900 text-white cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => {
                setAgreedToTerms(e.target.checked);
                if (e.target.checked) setValidationError(null);
              }}
              className="mt-0.5 rounded text-teal-500 focus:ring-teal-400 w-4 h-4"
            />
            <span className="text-xs leading-relaxed font-medium">
              I explicitly agree and authorize PFIS to securely share the selected intake data and
              accessibility profile with <strong>{hospital.name}</strong>. I retain the right to revoke
              this consent at any time from my privacy settings.
            </span>
          </label>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="outline" size="md" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleConfirm}
            isLoading={isLoading}
            icon={<Lock className="w-4 h-4" />}
          >
            Confirm & Transmit Request
          </Button>
        </div>
      </div>
    </Modal>
  );
};
