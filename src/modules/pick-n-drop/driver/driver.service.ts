import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, RideRequest, RideRequestDocument, LiveLocation, LiveLocationDocument } from '@mongodb/schemas';
import { PaginationDto } from '@dtos/pagination.dto';

@Injectable()
export class DriverService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(RideRequest.name) private rideRequestModel: Model<RideRequestDocument>,
        @InjectModel(LiveLocation.name) private liveLocationModel: Model<LiveLocationDocument>,
    ) { }

    async getDriverInfo(driverId: string) {
        return await this.userModel.findById(driverId).populate('vehicle.vehicleId').lean();
    }

    async updateAvailability(userId: string, availability: string) {
        return (await this.userModel.findByIdAndUpdate(userId, { $set: { availability } }, { new: true }))?.toObject();
    }

    async updateLocation(userId: string, lat: number, lng: number) {
        const user = await this.userModel.findById(userId).select('role').lean();

        await Promise.all([
            this.userModel.updateOne(
                { _id: new Types.ObjectId(userId) },
                { $set: { 'location.coordinates': [lng, lat], 'lastLocation.coordinates': [lng, lat] } }
            ),
            this.liveLocationModel.findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    userId: new Types.ObjectId(userId),
                    role: user?.role || 'provider',
                    location: { type: 'Point', coordinates: [lng, lat] },
                    lastUpdate: new Date()
                },
                { upsert: true, new: true }
            )
        ]);
        return { success: true };
    }

    async getDriverEarnings(driverId: string) {
        const driver = await this.userModel.findById(driverId);
        return driver?.earnings || { total: 0, today: 0, pending: 0 };
    }
}
