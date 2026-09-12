import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Hospital } from '../../types';
import { Button } from '../common/Button';
import { Building2, Navigation, Phone, CheckCircle } from 'lucide-react';

// Fix Leaflet Default Marker Icons in Webpack/Vite
const UserIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div style="background-color: #0d9488; width: 22px; height: 22px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 10px rgba(13,148,136,0.6); display: flex; align-items: center; justify-content: center;"><div style="width: 6px; height: 6px; background-color: #fff; border-radius: 50%;"></div></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

const HospitalIcon = L.divIcon({
  className: 'custom-hospital-marker',
  html: `<div style="background-color: #0f172a; color: #fff; width: 28px; height: 28px; border-radius: 8px; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 13px;">H</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const EmergencyIcon = L.divIcon({
  className: 'custom-emergency-marker',
  html: `<div style="background-color: #dc2626; color: #fff; width: 30px; height: 30px; border-radius: 8px; border: 2px solid #fff; box-shadow: 0 0 12px rgba(220,38,38,0.5); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">+</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

// Component to dynamically recenter map when center changes
const RecenterMap: React.FC<{ center: [number, number]; zoom?: number }> = ({
  center,
  zoom = 12,
}) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export interface HospitalMapProps {
  userLocation: { latitude: number; longitude: number };
  hospitals: Hospital[];
  selectedHospitalId?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  radiusKm?: number;
  height?: string;
}

export interface HospitalMapProps {
  userLocation: { latitude: number; longitude: number };
  hospitals: Hospital[];
  selectedHospitalId?: string;
  onSelectHospital?: (hospital: Hospital) => void;
  radiusKm?: number;
  height?: string;
}

export const HospitalMap: React.FC<HospitalMapProps> = ({
  userLocation,
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  radiusKm = 25,
  height = '460px',
}) => {
  const center: [number, number] = [userLocation.latitude, userLocation.longitude];
  const [mapLayer, setMapLayer] = useState<'street' | 'satellite' | 'terrain'>('street');

  const tileUrls = {
    street: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attr: '&copy; OpenStreetMap contributors',
    },
    satellite: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      attr: '&copy; Esri World Imagery & GIS Community',
    },
    terrain: {
      url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
      attr: '&copy; OpenTopoMap contributors',
    },
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-3 left-3 right-3 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Layer Switcher */}
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 flex items-center gap-1 pointer-events-auto">
          <button
            type="button"
            onClick={() => setMapLayer('street')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapLayer === 'street'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🗺️ Street
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapLayer === 'satellite'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            🛰️ Satellite
          </button>
          <button
            type="button"
            onClick={() => setMapLayer('terrain')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              mapLayer === 'terrain'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            ⛰️ Terrain
          </button>
        </div>

        {/* Status Badge & External Google Maps Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <a
            href={`https://www.google.com/maps/search/hospitals/@${userLocation.latitude},${userLocation.longitude},13z`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl shadow-md text-xs font-bold flex items-center gap-1.5 transition-all"
            title="Open Live Search in Official Google Maps"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Open Google Maps</span>
          </a>

          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Real GPS Active ({hospitals.length} Facilities)</span>
          </div>
        </div>
      </div>

      <div style={{ height }}>
        <MapContainer center={center} zoom={12} scrollWheelZoom={false} className="w-full h-full">
          <RecenterMap center={center} />
          <TileLayer
            key={mapLayer}
            attribution={tileUrls[mapLayer].attr}
            url={tileUrls[mapLayer].url}
          />

          {/* User Location Marker */}
          <Marker position={center} icon={UserIcon}>
            <Popup>
              <div className="p-1 space-y-1 text-xs">
                <div className="font-bold text-teal-700 flex items-center gap-1">
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Your Live GPS Location</span>
                </div>
                <p className="text-slate-500">
                  Lat: {userLocation.latitude.toFixed(4)}, Lng: {userLocation.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* User Radius Circle */}
          <Circle
            center={center}
            radius={radiusKm * 1000}
            pathOptions={{
              color: '#0d9488',
              fillColor: '#14b8a6',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />

          {/* Hospital Markers */}
          {hospitals.map((hosp) => {
            const isSelected = selectedHospitalId === hosp._id;
            const markerIcon = hosp.emergencyAvailable ? EmergencyIcon : HospitalIcon;

            return (
              <Marker
                key={hosp._id}
                position={[hosp.latitude, hosp.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="p-1.5 space-y-2 text-xs min-w-[220px]">
                    <div>
                      <div className="flex items-center gap-1 font-bold text-slate-900 text-sm">
                        <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        <span>{hosp.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{hosp.address}, {hosp.city}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-teal-700 font-bold">
                        {hosp.distanceKm !== undefined ? `📍 ${hosp.distanceKm} km away` : 'Nearby'}
                      </span>
                      <span className="text-slate-600">
                        {hosp.emergencyAvailable ? '🚨 24/7 Emergency' : 'OPD Open'}
                      </span>
                    </div>

                    {/* Google Maps Live Turn-by-Turn Navigation Link */}
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${hosp.latitude},${hosp.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Google Maps Navigation</span>
                    </a>

                    {onSelectHospital && (
                      <button
                        type="button"
                        onClick={() => onSelectHospital(hosp)}
                        className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors text-center block"
                      >
                        Book OPD Token & Doctor Details
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};
