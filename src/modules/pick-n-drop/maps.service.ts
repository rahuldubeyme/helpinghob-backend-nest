import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { AdminSetting, AdminSettingDocument } from '@mongodb/schemas/admin-settings.schema';

@Injectable()
export class MapsService {
    private readonly logger = new Logger(MapsService.name);

    constructor(
        @InjectModel(AdminSetting.name) private adminSettingModel: Model<AdminSettingDocument>
    ) { }

    private async getApiKey(): Promise<string> {
        const settings = await this.adminSettingModel.findOne({});
        return settings?.googleMapsApiKey || process.env.GOOGLE_MAPS_API_KEY || '';
    }

    async getDistanceAndDuration(
        origin: { lat: number; lng: number },
        destination: { lat: number; lng: number }
    ): Promise<{ distance: number; duration: number }> {
        try {
            const apiKey = await this.getApiKey();
            if (!apiKey) {
                this.logger.warn('Google Maps API Key not found. Using fallback values.');
                return { distance: 10000, duration: 900 }; // 10km, 15min
            }

            const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${apiKey}`;
            const response = await axios.get(url);

            if (response.data.status === 'OK' && response.data.rows[0].elements[0].status === 'OK') {
                const element = response.data.rows[0].elements[0];
                return {
                    distance: element.distance.value, // in meters
                    duration: element.duration.value, // in seconds
                };
            }

            this.logger.error(`Distance Matrix API error: ${response.data.status}`);
            return { distance: 10000, duration: 900 };
        } catch (error) {
            this.logger.error('Failed to fetch distance matrix', error);
            return { distance: 10000, duration: 900 };
        }
    }
}
