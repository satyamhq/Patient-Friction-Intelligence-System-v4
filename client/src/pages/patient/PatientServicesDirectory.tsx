import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Pill,
  Activity,
  Video,
  Ambulance,
  Phone,
  ShieldCheck,
  Search,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  Building,
} from 'lucide-react';
import { initiateHelplineCall, HELPLINE_PHONE_NUMBER } from '../../services/helplineCallingService';

export const PatientServicesDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const services = [
    {
      id: 'jan-aushadhi',
      title: 'Pradhan Mantri Jan Aushadhi Kendra',
      category: 'pharmacy',
      icon: Pill,
      badge: '50-90% Savings',
      description: 'Find nearby government-approved generic medicine stores offering high-quality medicines at a fraction of branded costs.',
      location: 'Available in 18 nearby blocks',
      actionUrl: '/patient/medicines',
      actionLabel: 'Check Medicine Stock',
      highlight: 'Over 1,800 generic drugs & surgical consumables available',
    },
    {
      id: 'diagnostic-labs',
      title: 'Government & Empaneled Diagnostic Labs',
      category: 'diagnostics',
      icon: Activity,
      badge: 'Free under PM-JAY',
      description: 'Book digital tokens for Blood tests (CBC, LFT, KFT), X-ray, Ultrasound, and CT scans with zero out-of-pocket friction.',
      location: '12 diagnostic centres nearby',
      actionUrl: '/patient/diagnostics',
      actionLabel: 'Book Diagnostic Slot',
      highlight: 'Digital lab reports uploaded directly to your Health Records Vault',
    },
    {
      id: 'teleconsultation',
      title: 'eSanjeevani & Specialist Teleconsultation',
      category: 'teleconsult',
      icon: Video,
      badge: 'Instant / Scheduled',
      description: 'Connect with general physicians and clinical specialists via encrypted video consult without traveling long distances.',
      location: '100% Online from Home',
      actionUrl: '/patient/teleconsult',
      actionLabel: 'Enter Teleconsult Room',
      highlight: 'Direct e-prescription generation signed by verified doctors',
    },
    {
      id: 'ambulance-transport',
      title: '108 / 102 Emergency Ambulance Network',
      category: 'emergency',
      icon: Ambulance,
      badge: '24/7 Free Dispatch',
      description: 'Rapid paramedic ambulance dispatch for cardiac, trauma, obstetric emergencies, and non-clinical patient mobility support.',
      location: 'Avg Response Time: 14 mins',
      actionUrl: 'tel:108',
      actionLabel: 'Dial 108 Dispatch',
      isExternal: true,
      highlight: '102 free transport for pregnant mothers and sick infants',
    },
    {
      id: 'helpline-desk',
      title: '24/7 Healthcare Coordination Helpline',
      category: 'support',
      icon: Phone,
      badge: 'Direct Helpline',
      description: 'Speak directly with our care coordination staff for hospital admissions, appointment rescheduling, and friction support.',
      location: 'Toll-free Assistance',
      actionUrl: 'call',
      actionLabel: `Call ${HELPLINE_PHONE_NUMBER}`,
      isCall: true,
      highlight: 'Real-time multilingual patient navigation in Hindi & regional languages',
    },
    {
      id: 'records-vault',
      title: 'ABHA Health Records & Document Vault',
      category: 'records',
      icon: ShieldCheck,
      badge: 'ABDM Verified',
      description: 'Store, view, and securely share your medical prescriptions, diagnostic test reports, and vaccination certificates.',
      location: 'Encrypted Cloud Storage',
      actionUrl: '/patient/health-records',
      actionLabel: 'Access Records Vault',
      highlight: 'Linked to your 14-digit Ayushman Bharat Health Account (ABHA)',
    },
  ];

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.highlight.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comprehensive Health Services</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Essential Healthcare Services Directory
            </h1>
            <p className="text-teal-100/90 text-sm max-w-2xl mt-1.5 leading-relaxed">
              Explore accessible public healthcare services—from low-cost Jan Aushadhi generic medicines and zero-friction diagnostic slots to 24/7 teleconsultation and emergency coordination.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => initiateHelplineCall()}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>Call Helpline ({HELPLINE_PHONE_NUMBER})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'pharmacy', label: 'Generic Medicines' },
            { id: 'diagnostics', label: 'Diagnostic Labs' },
            { id: 'teleconsult', label: 'Teleconsultation' },
            { id: 'emergency', label: 'Ambulance 108' },
            { id: 'records', label: 'Health Vault' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search services or schemes..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-teal-600 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredServices.map((service) => {
          const Icon = service.icon;
          return (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-teal-500 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {service.badge}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 mb-1.5 leading-snug">
                  {service.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {service.description}
                </p>

                <div className="space-y-1.5 py-2.5 border-t border-slate-100 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-teal-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="line-clamp-1">{service.highlight}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100">
                {service.isCall ? (
                  <button
                    type="button"
                    onClick={() => initiateHelplineCall()}
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{service.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : service.isExternal ? (
                  <a
                    href={service.actionUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{service.actionLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={service.actionUrl}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <span>{service.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
