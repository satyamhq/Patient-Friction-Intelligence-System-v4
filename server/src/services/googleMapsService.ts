import axios from 'axios';
import { config } from '../config/env.js';
import { FrictionEngine } from '../intelligence/friction/frictionEngine.js';

export interface DistanceMatrixResult {
  distanceKm: number;
  durationMinutes: number;
  isMockMode: boolean;
  originFormatted?: string;
  destinationFormatted?: string;
}

export class GoogleMapsService {
  /**
   * Calculates distance and travel time between two coordinates
   */
  public static async calculateDistance(
    originLat: number,
    originLng: number,
    destLat: number,
    destLng: number
  ): Promise<DistanceMatrixResult> {
    if (config.googleMapsApiKey && config.googleMapsApiKey.trim() !== '') {
      try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originLat},${originLng}&destinations=${destLat},${destLng}&key=${config.googleMapsApiKey}`;
        const response = await axios.get(url, { timeout: 3500 });
        const data = response.data;

        if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
          const element = data.rows[0].elements[0];
          const distanceMeters = element.distance.value;
          const durationSeconds = element.duration.value;

          return {
            distanceKm: parseFloat((distanceMeters / 1000).toFixed(1)),
            durationMinutes: Math.round(durationSeconds / 60),
            isMockMode: false,
            originFormatted: data.origin_addresses?.[0],
            destinationFormatted: data.destination_addresses?.[0],
          };
        }
      } catch (error) {
        console.warn('[GoogleMapsService] Google API call failed. Falling back to Demo Map Engine.');
      }
    }

    // Fallback: Haversine Calculation with realistic transit speed estimation
    const distanceKm = FrictionEngine.calculateHaversineDistance(
      originLat,
      originLng,
      destLat,
      destLng
    );
    // Approximate average speed of 35 km/h + 10 mins terminal overhead
    const durationMinutes = Math.round((distanceKm / 35) * 60 + 10);

    return {
      distanceKm,
      durationMinutes,
      isMockMode: true,
      originFormatted: `Coord (${originLat.toFixed(4)}, ${originLng.toFixed(4)})`,
      destinationFormatted: `Coord (${destLat.toFixed(4)}, ${destLng.toFixed(4)})`,
    };
  }
}
