import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, RideRequest, RideRequestDocument } from '@mongodb/schemas';

@Injectable()
export class DriverService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(RideRequest.name) private rideRequestModel: Model<RideRequestDocument>,
    ) { }

    async updateAvailability(userId: string, availability: string) {
        return await this.userModel.findByIdAndUpdate(userId, { $set: { availability } }, { new: true });
    }

    async getAvailableDrivers(vehicleId: string, lat: number, lng: number) {
        return this.userModel.find({
            roleName: 'driver',
            availability: 'Online',
            'vehicle.vehicleId': new Types.ObjectId(vehicleId),
            location: {
                $near: {
                    $geometry: { type: 'Point', coordinates: [lng, lat] },
                    $maxDistance: 10000 // 10km radius
                }
            }
        }).select('fullName avatar rating lastLocation vehicle').lean();
    }

    async updateLocation(userId: string, lat: number, lng: number) {
        return await this.userModel.updateOne(
            { _id: new Types.ObjectId(userId) },
            { $set: { 'location.coordinates': [lng, lat], 'lastLocation.coordinates': [lng, lat] } }
        );
    }

    async getDriverEarnings(driverId: string) {
        const driver = await this.userModel.findById(driverId);
        return driver?.earnings || { total: 0, today: 0, pending: 0 };
    }

    async getDriverRideHistory(driverId: string) {
        return await this.rideRequestModel.find({ driverId: new Types.ObjectId(driverId) })
            .populate('userId vehicleId')
            .sort({ createdAt: -1 });
    }
}
