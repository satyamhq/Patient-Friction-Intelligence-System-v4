import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { adminService } from '../../services/adminService';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { MapPin, Users, AlertTriangle, ArrowRight, ShieldCheck, Bus, Layers } from 'lucide-react';

const ClusterMarker = (level: string) => {
  const color =
    level === 'CRITICAL'
      ? '#ef4444'
      : level === 'HIGH'
      ? '#f97316'
      : level === 'MEDIUM'
      ? '#f59e0b'
      : '#10b981';

  return L.divIcon({
    className: 'custom-cluster-icon',
    html: `<div style="background-color: ${color}; color: #fff; width: 34px; height: 34px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 12px ${color}80; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">!</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
};

export const PopulationFrictionMap: React.FC = () => {
  const [clusters, setClusters] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMapData = async () => {
      try {
        const res = await adminService.getPopulationFrictionMap();
        if (res.success) {
          setClusters(res.clusters || []);
          if (res.clusters && res.clusters.length > 0) {
            setSelectedCluster(res.clusters[0]);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadMapData();
  }, []);

  if (isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  const center: [number, number] = [23.4000, 85.3500];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-brand-500" />
            Population Friction & Access Heatmap
          </h2>
          <p className="text-xs text-slate-500">
            Aggregated, anonymized geographic clusters highlighting systemic transit deserts and regional friction
          </p>
        </div>

        <div className="p-2.5 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-900 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span>Strictly anonymized cluster data. Zero individual patient records exposed.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container (Left 2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden border border-slate-200 shadow-md relative min-h-[500px]">
          <MapContainer center={center} zoom={9} className="w-full h-full min-h-[500px]">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {clusters.map((cluster) => {
              const markerIcon = ClusterMarker(cluster.frictionLevel);

              return (
                <React.Fragment key={cluster.id}>
                  <Marker
                    position={[cluster.center.lat, cluster.center.lng]}
                    icon={markerIcon}
                    eventHandlers={{
                      click: () => setSelectedCluster(cluster),
                    }}
                  >
                    <Popup>
                      <div className="p-1 space-y-1 text-xs">
                        <h4 className="font-bold text-slate-900">{cluster.name}</h4>
                        <p className="text-slate-500">{cluster.patientCount} Monitored Encounters</p>
                        <p className="font-bold text-teal-700">Friction: {cluster.averageFrictionScore}/100</p>
                        <button
                          onClick={() => setSelectedCluster(cluster)}
                          className="mt-1 w-full bg-slate-900 text-white px-2 py-1 rounded text-[11px] font-semibold"
                        >
                          Inspect Cluster
                        </button>
                      </div>
                    </Popup>
                  </Marker>

                  <Circle
                    center={[cluster.center.lat, cluster.center.lng]}
                    radius={15000}
                    pathOptions={{
                      color:
                        cluster.frictionLevel === 'CRITICAL'
                          ? '#ef4444'
                          : cluster.frictionLevel === 'HIGH'
                          ? '#f97316'
                          : '#f59e0b',
                      fillColor:
                        cluster.frictionLevel === 'CRITICAL'
                          ? '#ef4444'
                          : cluster.frictionLevel === 'HIGH'
                          ? '#f97316'
                          : '#f59e0b',
                      fillOpacity: 0.15,
                      weight: 1.5,
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>

        {/* Selected Cluster Details Drawer (Right 1 Col) */}
        <div className="space-y-4">
          {selectedCluster ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-card space-y-5">
              <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Selected Cluster</span>
                  <h3 className="text-lg font-black text-slate-900">{selectedCluster.name}</h3>
                </div>
                <StatusBadge status={selectedCluster.frictionLevel} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Monitored Cohort</span>
                  <span className="text-base font-black text-slate-900">{selectedCluster.patientCount} Patients</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Avg Distance</span>
                  <span className="text-base font-black text-slate-900">{selectedCluster.averageDistanceKm} km</span>
                </div>
              </div>

              {/* Dominant Barriers Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Cluster Barrier Breakdown (0–100)
                </span>
                <div className="space-y-2 text-xs">
                  {Object.entries(selectedCluster.barrierBreakdown || {}).map(([dim, val]: any) => (
                    <div key={dim} className="space-y-1">
                      <div className="flex justify-between text-slate-700 font-medium">
                        <span>{dim} Friction</span>
                        <span className="font-bold">{val} / 100</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            val >= 75 ? 'bg-rose-500' : val >= 50 ? 'bg-amber-500' : 'bg-teal-500'
                          }`}
                          style={{ width: `${val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Systemic Intervention */}
              <div className="p-4 bg-teal-50 rounded-2xl border border-teal-200 text-xs space-y-1.5">
                <span className="text-[10px] font-bold text-teal-800 uppercase flex items-center gap-1">
                  💡 Priority Recommended Intervention
                </span>
                <p className="font-bold text-teal-950 text-sm">{selectedCluster.recommendedIntervention}</p>
                <p className="text-teal-800 leading-relaxed text-[11px]">
                  Simulated to reduce regional journey dropouts by ~42% across this specific habitation cluster.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-400">
              Click any cluster marker on the map to inspect regional friction breakdowns.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
