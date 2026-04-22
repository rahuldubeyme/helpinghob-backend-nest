import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MapRoute, MapRouteDocument } from '@mongodb/schemas';

@Injectable()
export class MapsCacheService {
    private readonly logger = new Logger(MapsCacheService.name);

    constructor(
        @InjectModel(MapRoute.name) private mapRouteModel: Model<MapRouteDocument>
    ) { }

    private generateKey(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }): string {
        // Round to 4 decimal places for better cache hits (approx 11m precision)
        const lat1 = origin.lat.toFixed(4);
        const lng1 = origin.lng.toFixed(4);
        const lat2 = destination.lat.toFixed(4);
        const lng2 = destination.lng.toFixed(4);
        return `map_route:${lat1},${lng1}:${lat2},${lng2}`;
    }

    async getCachedRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
        try {
            const routeKey = this.generateKey(origin, destination);
            const cached = await this.mapRouteModel.findOne({ routeKey }).lean();
            if (cached) {
                return {
                    distance: cached.distance,
                    duration: cached.duration,
                    polyline: cached.polyline
                };
            }
            return null;
        } catch (e) {
            this.logger.error('Failed to get cached route', e);
            return null;
        }
    }

    async cacheRoute(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, data: any) {
        try {
            const routeKey = this.generateKey(origin, destination);
            await this.mapRouteModel.findOneAndUpdate(
                { routeKey },
                {
                    routeKey,
                    origin,
                    destination,
                    distance: data.distance,
                    duration: data.duration,
                    polyline: data.polyline
                },
                { upsert: true, new: true }
            );
        } catch (e) {
            this.logger.error('Failed to cache route', e);
        }
    }
}
