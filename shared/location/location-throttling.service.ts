import { Injectable } from '@nestjs/common';
import { getHaversineDistance } from '@common/utils/location.util';

interface LastUpdate {
    lat: number;
    lng: number;
    timestamp: number;
}

@Injectable()
export class LocationThrottlingService {
    private lastUpdates = new Map<string, LastUpdate>();

    private readonly MIN_DISTANCE_METERS = 10;
    private readonly MIN_INTERVAL_MS = 3000;

    /**
     * Determines if a location update should be processed or throttled
     * @param driverId Unique ID of the driver
     * @param newLat New latitude
     * @param newLng New longitude
     * @returns Boolean indicating if update should be accepted
     */
    shouldUpdateLocation(driverId: string, newLat: number, newLng: number): boolean {
        const now = Date.now();
        const last = this.lastUpdates.get(driverId);

        if (!last) {
            this.lastUpdates.set(driverId, { lat: newLat, lng: newLng, timestamp: now });
            return true;
        }

        const timePassed = now - last.timestamp;
        const distanceMoved = getHaversineDistance(last.lat, last.lng, newLat, newLng);

        // Throttle if time interval is too short OR distance moved is negligible
        if (timePassed < this.MIN_INTERVAL_MS || distanceMoved < this.MIN_DISTANCE_METERS) {
            return false;
        }

        // Update last processed state
        this.lastUpdates.set(driverId, { lat: newLat, lng: newLng, timestamp: now });
        return true;
    }

    clearDriver(driverId: string) {
        this.lastUpdates.delete(driverId);
    }
}
