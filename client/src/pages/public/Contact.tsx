import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Building2, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Hospital Empanelment & Integration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Connect your hospital or district health department to the PFIS accessibility network
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900">Hospital Onboarding Desk</h3>

          {submitted ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              <p className="font-bold">Thank you for your onboarding request!</p>
              <p>Our integration team will contact you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Your Name / Facility Representative"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Rajesh Gupta"
                required
              />
              <Input
                label="Official Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rajesh@hospital.org"
                required
              />
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message / Integration Requirements
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  rows={3}
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  placeholder="Inquiring about connecting our 300-bed hospital OPD queue to PFIS."
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="md" className="w-full" icon={<Send className="w-4 h-4" />}>
                Submit Request
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-4 text-xs text-slate-600">
          <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4">
            <h4 className="font-bold text-sm text-teal-300">National Health Coordination Center</h4>
            <div className="space-y-2 text-slate-300">
              <p className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>National Healthcare Accessibility Initiative</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>Ranchi Medical Enclave, Bariatu, Jharkhand</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-teal-400" />
                <span>integration@pfis.org</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
