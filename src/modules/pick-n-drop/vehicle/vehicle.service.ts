import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category, CategoryDocument, User, UserDocument, Vehicle, VehicleDocument } from '@mongodb/schemas';
import { MapsService } from '@shared/maps/maps.service';

import { RidePricingDto } from './dto/vehicle.dto';

@Injectable()
export class VehicleService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
        private readonly mapsService: MapsService,
    ) { }

    async getVehicles() {
        return this.categoryModel.find({ isDeleted: false, isSuspended: false, masterId: 19 }).sort({ title: 1 }).lean();
    }

    async getVehiclePricing(body: RidePricingDto) {
        const { source, destination, vehicleId } = body;

        // Find the category to ensure it exists
        const category = await this.categoryModel.findOne({
            _id: new Types.ObjectId(vehicleId),
            isDeleted: false,
            isSuspended: false
        }).lean();

        if (!category) {
            return []; // Or throw an error if preferred
        }

        // Find available drivers in this category and populate their vehicle pricing info
        const findDrivers = await this.userModel.find({
            isDeleted: false,
            isSuspended: false,
            'vehicle.vehicleId': new Types.ObjectId(vehicleId),
            roleName: 'driver',
            role: 2
        })
            .populate('vehicle.vehicleId')
            .lean();

        let distanceInKm = 10; // Default fallback
        let durationInMin = 15; // Default fallback

        if (source?.lat && source?.lng && destination?.lat && destination?.lng) {
            const metrics = await this.mapsService.getDistanceAndDuration(source, destination);
            console.log('metrics:::::::;', metrics);
            distanceInKm = metrics.distance / 1000;
            durationInMin = Math.ceil(metrics.duration / 60);
        }

        // Live Scenario: Surge Pricing Simulation
        const hour = new Date().getHours();
        let surgeMultiplier = 1.0;
        if (hour >= 18 && hour <= 21) surgeMultiplier = 1.5; // Peak evening hours
        else if (hour >= 8 && hour <= 10) surgeMultiplier = 1.3; // Peak morning hours

        const drivers = findDrivers.map((d: any) => {
            const vInfo = d.vehicle?.vehicleId;
            const basePrice = (vInfo?.baseFare || 0) + (distanceInKm * (vInfo?.perKmRate || 0));

            return {
                id: d._id,
                name: d.fullName,
                avatar: d.avatar,
                rating: d.rating || 0,
                totalReviews: d.totalReviews || 0,
                experience: d.experience || 0,
                vehicleInfo: {
                    name: vInfo?.title || d.vehicle?.model || 'Standard Vehicle',
                    type: vInfo?.type || 'car',
                    color: d.vehicle?.color,
                    numberPlate: d.vehicle?.numberPlate,
                    icon: vInfo?.icon || category.icon
                },
                price: Math.round(basePrice * surgeMultiplier),
                surgeMultiplier: surgeMultiplier > 1 ? surgeMultiplier : undefined,
                eta: durationInMin + 5,
            };
        });

        return {
            distance: distanceInKm.toFixed(1),
            unit: 'km',
            duration: `${durationInMin} min`,
            drivers: drivers
        };
    }
}
