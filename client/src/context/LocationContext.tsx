import React, { createContext, useContext, useState, useEffect } from 'react';
import { patientService } from '../services/patientService';

export interface UserCoords {
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isManual: boolean;
}

export type LocationPermissionStatus = 'prompt' | 'granted' | 'denied' | 'unavailable';

interface LocationContextType {
  coords: UserCoords;
  permissionStatus: LocationPermissionStatus;
  isLoading: boolean;
  errorMessage: string | null;
  requestCurrentLocation: () => Promise<UserCoords | null>;
  setManualLocation: (loc: Partial<UserCoords>) => void;
}

// Default fallback coordinate (Phagwara / Punjab Regional Medical Hub)
const DEFAULT_COORDS: UserCoords = {
  latitude: 31.2229,
  longitude: 75.7725,
  address: 'GT Road, Phagwara, Punjab',
  city: 'Phagwara',
  pincode: '144401',
  isManual: true,
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Helper: Real-time Reverse Geocode using OpenStreetMap Nominatim
async function reverseGeocode(lat: number, lng: number): Promise<{
  address: string;
  city: string;
  state: string;
  pincode: string;
}> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'PFIS-Healthcare-Intelligence/1.0' } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.suburb ||
      addr.village ||
      addr.county ||
      addr.state_district ||
      'Detected City';
    const state = addr.state || 'Punjab';
    const road = addr.road || addr.residential || addr.neighbourhood || '';
    const locality = addr.suburb || addr.town || city;
    const address = road ? `${road}, ${locality}` : (data.display_name?.split(',').slice(0, 3).join(', ') || `${city}, ${state}`);
    const pincode = addr.postcode || '144411';

    return { address, city, state, pincode };
  } catch (e) {
    console.warn('[LocationContext] Reverse geocode error:', e);
    return {
      address: `GPS Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      city: 'Local Area',
      state: 'Punjab',
      pincode: '144411',
    };
  }
}

// Helper: IP Geolocation Fallback when browser GPS is blocked or denied
async function fetchIpLocation(): Promise<UserCoords | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { timeout: 4000 } as any);
    const data = await res.json();
    if (data && data.latitude && data.longitude) {
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        address: `${data.city || 'Local Area'}, ${data.region || data.country_name || ''}`,
        city: data.city || 'Local City',
        state: data.region || 'Punjab',
        pincode: data.postal || '144411',
        isManual: false,
      };
    }
  } catch {}
  return null;
}

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<UserCoords>(() => {
    try {
      const saved = localStorage.getItem('pfis_user_coords');
      return saved ? JSON.parse(saved) : DEFAULT_COORDS;
    } catch {
      localStorage.removeItem('pfis_user_coords');
      return DEFAULT_COORDS;
    }
  });
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>('prompt');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Automatically detect real-world GPS position upon initial mount
    requestCurrentLocation();
  }, []);

  const requestCurrentLocation = (): Promise<UserCoords | null> => {
    setIsLoading(true);
    setErrorMessage(null);

    return new Promise(async (resolve) => {
      if (!navigator.geolocation) {
        // Fallback to IP geolocation
        const ipLoc = await fetchIpLocation();
        if (ipLoc) {
          setCoords(ipLoc);
          setPermissionStatus('granted');
          localStorage.setItem('pfis_user_coords', JSON.stringify(ipLoc));
          setIsLoading(false);
          resolve(ipLoc);
        } else {
          setPermissionStatus('unavailable');
          setErrorMessage('Geolocation is not supported by your browser. Using regional coordinates.');
          setIsLoading(false);
          resolve(null);
        }
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Perform real-time reverse geocoding to extract real address & city
          const geoInfo = await reverseGeocode(lat, lng);

          const newCoords: UserCoords = {
            latitude: lat,
            longitude: lng,
            address: geoInfo.address,
            city: geoInfo.city,
            pincode: geoInfo.pincode,
            isManual: false,
          };

          setCoords(newCoords);
          setPermissionStatus('granted');
          setIsLoading(false);
          localStorage.setItem('pfis_user_coords', JSON.stringify(newCoords));

          // Sync real location to logged-in user profile in backend database
          if (localStorage.getItem('pfis_auth_token')) {
            try {
              await patientService.updateProfile({
                location: {
                  address: geoInfo.address,
                  city: geoInfo.city,
                  state: geoInfo.state,
                  pincode: geoInfo.pincode,
                  latitude: lat,
                  longitude: lng,
                } as any,
              });
            } catch (e) {
              // non-fatal
            }
          }
          resolve(newCoords);
        },
        async (error) => {
          console.warn('[LocationContext] GPS denied or timed out, trying IP geolocation...', error.message);
          const ipLoc = await fetchIpLocation();
          if (ipLoc) {
            setCoords(ipLoc);
            setPermissionStatus('granted');
            localStorage.setItem('pfis_user_coords', JSON.stringify(ipLoc));
            setIsLoading(false);
            resolve(ipLoc);
          } else {
            setPermissionStatus(error.code === error.PERMISSION_DENIED ? 'denied' : 'unavailable');
            setErrorMessage('Location permission was denied. You can manually enter your village or pincode below.');
            setIsLoading(false);
            resolve(null);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const setManualLocation = async (loc: Partial<UserCoords>) => {
    let updated = { ...coords, ...loc, isManual: true };
    if (loc.latitude && loc.longitude && (!loc.address || !loc.city)) {
      const geo = await reverseGeocode(loc.latitude, loc.longitude);
      updated = { ...updated, ...geo };
    }
    setCoords(updated);
    localStorage.setItem('pfis_user_coords', JSON.stringify(updated));
    setErrorMessage(null);
  };

  return (
    <LocationContext.Provider
      value={{
        coords,
        permissionStatus,
        isLoading,
        errorMessage,
        requestCurrentLocation,
        setManualLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
