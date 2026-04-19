import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument, RideRequest, RideRequestDocument } from '@mongodb/schemas';
import { PaginationDto } from '@dtos/pagination.dto';

@Injectable()
export class DriverService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(RideRequest.name) private rideRequestModel: Model<RideRequestDocument>,
    ) { }

    async getDriverInfo(driverId: string) {
        return await this.userModel.findById(driverId).populate('vehicle.vehicleId').lean();
    }

    async updateAvailability(userId: string, availability: string) {
        return (await this.userModel.findByIdAndUpdate(userId, { $set: { availability } }, { new: true }))?.toObject();
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

    async getDriverRideHistory(driverId: string, query: PaginationDto) {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const [history, total] = await Promise.all([
            this.rideRequestModel.find({ driverId: new Types.ObjectId(driverId) })
                .populate('userId vehicleId')
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 })
                .lean(),
            this.rideRequestModel.countDocuments({ driverId: new Types.ObjectId(driverId) })
        ]);

        return { history, total, page, limit };
    }
}
