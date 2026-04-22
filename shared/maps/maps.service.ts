import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { AdminSetting, AdminSettingDocument } from '@mongodb/schemas/admin-settings.schema';

import { getHaversineDistance, estimateTravelTime } from '@common/utils/location.util';

import { MapsCacheService } from './maps-cache.service';

@Injectable()
export class MapsService {
    private readonly logger = new Logger(MapsService.name);

    constructor(
        @InjectModel(AdminSetting.name) private adminSettingModel: Model<AdminSettingDocument>,
        private readonly cacheService: MapsCacheService,
    ) { }

    private async getApiKey(): Promise<string> {
        const settings = await this.adminSettingModel.findOne({});
        return settings?.googleMapsApiKey || process.env.GOOGLE_MAPS_API_KEY || '';
    }

    /**
     * Local computation of distance and duration (FREE)
     */
    getEstimatedMetrics(
        origin: { lat: number; lng: number },
        destination: { lat: number; lng: number }
    ): { distance: number; duration: number } {
        const distance = getHaversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);
        // Apply city transit overhead factor (typically 1.2x - 1.4x the crow-flies distance)
        const adjustedDistance = Math.round(distance * 1.3);
        const duration = estimateTravelTime(adjustedDistance);

        return { distance: adjustedDistance, duration };
    }

    async getDistanceAndDuration(
        origin: { lat: number; lng: number },
        destination: { lat: number; lng: number },
        useRealApi: boolean = false
    ): Promise<{ distance: number; duration: number }> {
        // Default to local estimation to save costs unless explicitly requested
        if (!useRealApi) {
            return this.getEstimatedMetrics(origin, destination);
        }

        // Check Cache first
        const cached = await this.cacheService.getCachedRoute(origin, destination);
        if (cached) return cached;

        try {
            const apiKey = await this.getApiKey();
            if (!apiKey) {
                this.logger.warn('Google Maps API Key not found. Using local estimation.');
                return this.getEstimatedMetrics(origin, destination);
            }

            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`;
            const response = await axios.get(url);

            if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
                const element = response.data.rows[0].elements[0];
                const metrics = {
                    distance: element.distance.value,
                    duration: element.duration.value,
                };
                // Store in cache
                await this.cacheService.cacheRoute(origin, destination, metrics);
                return metrics;
            }

            return this.getEstimatedMetrics(origin, destination);
        } catch (error) {
            this.logger.error('Failed to fetch distance matrix', error);
            return this.getEstimatedMetrics(origin, destination);
        }
    }
}
