import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vehicle, VehicleDocument } from '@mongodb/schemas';
import { MapsService } from '../maps.service';

@Injectable()
export class VehicleService {
    constructor(
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        private readonly mapsService: MapsService,
    ) { }

    async getVehicles() {
        return this.vehicleModel.find({ isDeleted: false, isSuspended: false }).sort({ title: 1 }).lean();
    }

    async getVehiclePricing(body: any) {
        const { source, destination } = body;
        const vehicles = await this.vehicleModel.find({ isDeleted: false });

        let distanceInKm = 10; // Default fallback
        let durationInMin = 15; // Default fallback

        if (source?.lat && source?.lng && destination?.lat && destination?.lng) {
            const metrics = await this.mapsService.getDistanceAndDuration(source, destination);
            distanceInKm = metrics.distance / 1000;
            durationInMin = Math.ceil(metrics.duration / 60);
        }

        // Live Scenario: Surge Pricing Simulation
        const hour = new Date().getHours();
        let surgeMultiplier = 1.0;
        if (hour >= 18 && hour <= 21) surgeMultiplier = 1.5; // Peak evening hours
        else if (hour >= 8 && hour <= 10) surgeMultiplier = 1.3; // Peak morning hours

        return vehicles.map((v: any) => {
            const basePrice = (v.baseFare || 0) + (distanceInKm * (v.perKmRate || 0));
            return {
                id: v._id,
                name: v.title,
                type: v.type,
                icon: v.icon,
                capacity: v.capacity,
                price: Math.round(basePrice * surgeMultiplier),
                surgeMultiplier: surgeMultiplier > 1 ? surgeMultiplier : undefined,
                eta: durationInMin + 5,
            };
        });
    }
}
