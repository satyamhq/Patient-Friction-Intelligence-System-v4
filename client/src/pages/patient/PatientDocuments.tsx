import React, { useState, useEffect } from 'react';
import { documentService } from '../../services/documentService';
import { PatientDocument } from '../../types';
import { Button } from '../../components/common/Button';
import { Input, Select } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { ErrorAlert } from '../../components/common/ErrorAlert';
import {
  FolderLock,
  Upload,
  FileText,
  Trash2,
  Eye,
  ShieldCheck,
  Plus,
  CheckCircle2,
} from 'lucide-react';

export const PatientDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  // Upload Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Medical Report');
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await documentService.getPatientDocuments();
      if (res.success) {
        setDocuments(res.documents || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('type', type);
      if (notes) formData.append('notes', notes);

      const res = await documentService.upload(formData);
      if (res.success) {
        setSuccessMsg('Document successfully uploaded to your secure health vault.');
        setIsUploadModalOpen(false);
        setTitle('');
        setFile(null);
        setNotes('');
        fetchDocuments();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload document.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to remove this document?')) return;
    try {
      await documentService.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d._id !== docId));
      setSuccessMsg('Document removed successfully.');
    } catch (e) {
      setError('Failed to delete document.');
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderLock className="w-6 h-6 text-brand-500" />
            Secure Medical Document Vault
          </h2>
          <p className="text-xs text-slate-500">
            Encrypted storage for prescriptions, Ayushman Bharat PM-JAY cards, and diagnostic baseline reports
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setIsUploadModalOpen(true);
            setError(null);
          }}
          icon={<Upload className="w-4 h-4" />}
        >
          Upload Document
        </Button>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && <ErrorAlert message={error} onDismiss={() => setError(null)} />}

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : documents.length === 0 ? (
        <EmptyState
          title="No Documents Uploaded Yet"
          description="Upload your prior doctor prescriptions, diagnostic reports, and identity cards to quickly attach them to hospital intake requests."
          actionText="Upload First Document"
          onAction={() => setIsUploadModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 truncate">
                  <div className="p-2.5 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="truncate space-y-0.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                      {doc.type}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 truncate">{doc.title}</h4>
                    <p className="text-[11px] text-slate-400 truncate">{doc.originalFilename}</p>
                  </div>
                </div>
              </div>

              {doc.notes && (
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  {doc.notes}
                </p>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                <span>{formatBytes(doc.fileSizeBytes)} • {new Date(doc.uploadedAt).toLocaleDateString()}</span>

                <div className="flex items-center gap-1">
                  <a
                    href={`/api/documents/${doc._id}/file`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-brand-600 transition-colors flex items-center gap-1 font-semibold"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                  <button
                    onClick={() => handleDelete(doc._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Medical Document"
        subtitle="Secure encrypted storage for your healthcare records"
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Previous Cardiology Prescription (2025)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Select
            label="Document Category"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={[
              { label: 'Doctor Prescription', value: 'Prescription' },
              { label: 'Medical Lab / Radiology Report', value: 'Medical Report' },
              { label: 'Doctor Referral Letter', value: 'Referral' },
              { label: 'Ayushman Bharat / ID Card', value: 'ID Card' },
              { label: 'Other Healthcare Record', value: 'Other' },
            ]}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Document File (PDF, PNG, JPG - Max 10MB)
            </label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Notes / Prescription Summary (Optional)
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              rows={2}
              placeholder="e.g. Prescribed medication for blood pressure and past ECG results."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isUploading}>
              Upload to Vault
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
