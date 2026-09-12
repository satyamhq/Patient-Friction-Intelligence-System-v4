import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  publicHealthService,
  EssentialMedicine,
  MedicineStatus,
  DispensingMethod,
} from '../../services/publicHealthService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Building2,
  Package,
  Calendar,
  Activity,
  MapPin,
  RefreshCw,
  Clock,
  ShieldCheck,
  Edit3,
  X,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';

export const MedicineAvailabilityPage: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [medicines, setMedicines] = useState<EssentialMedicine[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Alternate stock modal state
  const [alternateModalMedicine, setAlternateModalMedicine] = useState<EssentialMedicine | null>(null);

  // Staff stock update modal state
  const [staffUpdateMedicine, setStaffUpdateMedicine] = useState<EssentialMedicine | null>(null);
  const [updateStockCount, setUpdateStockCount] = useState<string>('');
  const [updateReason, setUpdateReason] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchMedicines = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      const data = await publicHealthService.getMedicines({
        search: searchQuery.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
      });
      setMedicines(data);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Medicine availability could not be loaded.';
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchMedicines();
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedCategory, selectedStatus]);

  const categories = [
    'All',
    'Analgesic',
    'Antibiotic',
    'Anti-Hypertensive',
    'Anti-Diabetic',
    'Maternal Health',
    'Emergency / Antidote',
    'Vaccine',
  ];

  const statuses = ['All', 'In Stock', 'Low Stock', 'Out of Stock', 'Availability Unknown'];

  const isOutdated = (updatedAt?: string): boolean => {
    if (!updatedAt) return true;
    const updatedDate = new Date(updatedAt);
    if (isNaN(updatedDate.getTime())) return false;
    const diffDays = (Date.now() - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays > 14;
  };

  const formatTimestamp = (dateStr?: string): string => {
    if (!dateStr) return 'Date not recorded';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime())
        ? 'Date not recorded'
        : d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'Date not recorded';
    }
  };

  // Status visual badge configuration
  const renderStatusBadge = (status: MedicineStatus) => {
    switch (status) {
      case 'In Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>In Stock</span>
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/40">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Low Stock</span>
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300/40">
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
            <span>Out of Stock</span>
          </span>
        );
      case 'Availability Unknown':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/40">
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Availability Unknown</span>
          </span>
        );
    }
  };

  // Dispensing method badge
  const renderDispensingBadge = (method: DispensingMethod) => {
    switch (method) {
      case 'Walk-in available':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
            Walk-in available
          </span>
        );
      case 'OPD dispensing':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60">
            OPD dispensing
          </span>
        );
      case 'Emergency only':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
            Emergency only
          </span>
        );
      case 'Appointment required':
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
            Appointment required
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {method || 'Unknown'}
          </span>
        );
    }
  };

  // Find genuine alternate facilities for the selected medicine
  const alternateFacilities = useMemo(() => {
    if (!alternateModalMedicine) return [];
    return medicines.filter(
      (m) =>
        m.id !== alternateModalMedicine.id &&
        m.generic_name.trim().toLowerCase() === alternateModalMedicine.generic_name.trim().toLowerCase()
    );
  }, [alternateModalMedicine, medicines]);

  // Handle staff stock update
  const handleSaveStockUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffUpdateMedicine) return;

    try {
      setIsUpdating(true);
      const parsedStock = updateStockCount === '' ? null : parseInt(updateStockCount, 10);
      if (updateStockCount !== '' && (isNaN(parsedStock as number) || (parsedStock as number) < 0)) {
        showToast('Please enter a valid non-negative number or leave blank.', 'error');
        setIsUpdating(false);
        return;
      }

      await publicHealthService.updateMedicineStock(staffUpdateMedicine.id, {
        stockCount: parsedStock,
        reason: updateReason.trim() || undefined,
      });

      showToast(`Stock updated for ${staffUpdateMedicine.medicine_name}.`, 'success');
      setStaffUpdateMedicine(null);
      setUpdateStockCount('');
      setUpdateReason('');
      fetchMedicines();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to update stock';
      showToast(msg, 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const isStaffUser = user?.role === 'hospital' || user?.role === 'admin';

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold tracking-wider">
              <Activity className="w-3.5 h-3.5" />
              <span>e-Aushadhi Medicines</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Inventory data from verified facility sources</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Medicine Availability & Stock
          </h1>
          <p className="text-emerald-100/90 text-sm max-w-2xl leading-relaxed">
            Check medicine availability at verified healthcare facilities before you travel. Stock levels and dispensing protocols are maintained directly by participating health centers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search medicine, generic name, or facility..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-900 dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs overflow-x-auto">
            {statuses.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-all whitespace-nowrap text-xs ${
                  selectedStatus === st
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {/* Refresh Button */}
          <button
            onClick={fetchMedicines}
            disabled={isLoading}
            title="Refresh Stock"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Medicines Table / Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Verified Essential Medicines ({medicines.length} Listed Items)</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Source: Facility Stock Registers
          </span>
        </div>

        {isLoading ? (
          <div className="p-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 mx-auto text-emerald-600 animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Checking medicine availability ledgers...</p>
          </div>
        ) : errorMessage ? (
          <div className="p-12 text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
            <div className="text-slate-800 dark:text-slate-200 font-semibold text-base">
              Medicine availability could not be loaded.
            </div>
            <p className="text-slate-500 text-xs max-w-md mx-auto">{errorMessage}</p>
            <button
              onClick={fetchMedicines}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs"
            >
              Retry
            </button>
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-slate-800 dark:text-slate-200 font-semibold text-base">
              {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                ? 'No matching medicine found.'
                : 'No medicine availability data found.'}
            </div>
            <p className="text-slate-400 text-xs">
              Try adjusting your search terms or clearing the status and category filters.
            </p>
            {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedStatus('All');
                }}
                className="mt-2 px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Medicine & Formulation</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Dispensing Facility</th>
                  <th className="py-3.5 px-4">Stock Count</th>
                  <th className="py-3.5 px-4">Availability Status</th>
                  <th className="py-3.5 px-4">Dispensing Protocol</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {medicines.map((m) => {
                  const outdated = isOutdated(m.updated_at);
                  return (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Medicine details */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-900 dark:text-white text-sm">
                          {m.medicine_name}
                        </div>
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] block mt-0.5">
                          {m.generic_name} • {m.dosage_form}
                        </span>
                        {m.source && (
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Source: {m.source}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 align-top">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                          {m.category}
                        </span>
                      </td>

                      {/* Facility */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {m.facility_name}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-teal-600 dark:text-teal-400 text-[11px] font-semibold">
                            {m.facility_tier}
                          </span>
                          {m.verification_status === 'VERIFIED' && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock Count */}
                      <td className="py-3.5 px-4 align-top">
                        {m.stock_count !== null && m.stock_count !== undefined ? (
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {m.stock_count} units
                          </div>
                        ) : (
                          <div className="font-medium text-slate-500 italic text-xs">
                            Stock quantity unavailable
                          </div>
                        )}
                        <span className="text-slate-400 text-[10px] block mt-0.5">
                          Min. Threshold: {m.min_threshold}
                        </span>
                      </td>

                      {/* Availability status & Freshness */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div>{renderStatusBadge(m.status)}</div>
                          {outdated ? (
                            <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                              <Clock className="w-3 h-3" />
                              <span>Stock information may be outdated.</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Updated {formatTimestamp(m.updated_at)}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Dispensing method */}
                      <td className="py-3.5 px-4 align-top">
                        {renderDispensingBadge(m.dispensing_method)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex flex-col items-end gap-1.5">
                          {/* Patient find alternate button */}
                          <button
                            onClick={() => setAlternateModalMedicine(m)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11px] font-semibold transition-all inline-flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Find Alternate Stock</span>
                          </button>

                          {/* Staff quick update button */}
                          {isStaffUser && (
                            <button
                              onClick={() => {
                                setStaffUpdateMedicine(m);
                                setUpdateStockCount(m.stock_count !== null ? String(m.stock_count) : '');
                                setUpdateReason('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer transition"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Update Stock</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Honest Alternate Stock Modal */}
      {alternateModalMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Alternate Facility Discovery
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {alternateModalMedicine.generic_name}
                </h3>
                <p className="text-xs text-slate-500">
                  Target Drug: <span className="font-semibold text-slate-700 dark:text-slate-300">{alternateModalMedicine.medicine_name}</span> at {alternateModalMedicine.facility_name}
                </p>
              </div>
              <button
                onClick={() => setAlternateModalMedicine(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1 space-y-3">
              {alternateFacilities.length === 0 ? (
                <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Package className="w-8 h-8 mx-auto text-slate-400" />
                  <p className="text-slate-800 dark:text-slate-200 font-bold text-sm">
                    No verified alternate facility found with stock.
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Currently, no other public healthcare facility in the system has verified inventory reported for formulation &quot;{alternateModalMedicine.generic_name}&quot;.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Found {alternateFacilities.length} verified facilities with this generic formulation:
                  </div>
                  {alternateFacilities.map((alt) => {
                    const altOutdated = isOutdated(alt.updated_at);
                    return (
                      <div
                        key={alt.id}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-emerald-300 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white text-sm">
                              {alt.facility_name}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold">
                              {alt.facility_tier}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {alt.medicine_name} • {alt.dosage_form}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                            {renderDispensingBadge(alt.dispensing_method)}
                            {altOutdated ? (
                              <span className="text-[10px] text-amber-600 font-medium">
                                ⚠️ Information may be outdated
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Updated {formatTimestamp(alt.updated_at)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 dark:border-slate-700">
                          {renderStatusBadge(alt.status)}
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {alt.stock_count !== null && alt.stock_count !== undefined
                              ? `${alt.stock_count} units`
                              : 'Quantity unavailable'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                onClick={() => {
                  setSearchQuery(alternateModalMedicine.generic_name);
                  setAlternateModalMedicine(null);
                }}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1"
              >
                <span>Filter main list by &quot;{alternateModalMedicine.generic_name}&quot;</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setAlternateModalMedicine(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Stock Update Modal */}
      {staffUpdateMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Authorized Facility Staff Update
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  Update Stock Count
                </h3>
              </div>
              <button
                onClick={() => setStaffUpdateMedicine(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStockUpdate} className="space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                <div>
                  <span className="text-slate-400">Medicine:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {staffUpdateMedicine.medicine_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Facility:</span>{' '}
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {staffUpdateMedicine.facility_name}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Current Stock:</span>{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {staffUpdateMedicine.stock_count !== null ? `${staffUpdateMedicine.stock_count} units` : 'Unavailable'}
                  </span>{' '}
                  (Min. Threshold: {staffUpdateMedicine.min_threshold})
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Verified Stock Count
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 50 (leave empty if count is unknown)"
                  value={updateStockCount}
                  onChange={(e) => setUpdateStockCount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Status is automatically recalculated based on minimum threshold ({staffUpdateMedicine.min_threshold}).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason for Update / Audit Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Routine physical audit, fresh consignment intake"
                  value={updateReason}
                  onChange={(e) => setUpdateReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Logged in persistent audit records with user identifier and timestamp.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStaffUpdateMedicine(null)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Verified Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
