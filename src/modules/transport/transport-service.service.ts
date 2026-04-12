

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle, VehicleDocument } from '@mongodb/schemas/vehicle.schema';
import { RideRequest, RideRequestDocument } from '@mongodb/schemas/ride-request.schema';

@Injectable()
export class TransportService {
    constructor(
        @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
        @InjectModel(RideRequest.name) private rideRequestModel: Model<RideRequestDocument>,
    ) { }

    async getTransportVehicles() {
        // Usually larger vehicles for transport
        return await this.vehicleModel.find({ type: { $in: ['truck', 'van', 'tempo'] }, isDeleted: false }).lean();
    }

    async createRideRequest(userId: string, body: any) {
        const rideRequest = new this.rideRequestModel({
            userId: new Types.ObjectId(userId),
            ...body,
        });
        return await rideRequest.save();
    }

    async getRideHistory(userId: string) {
        if (!Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid User ID');
        }
        return await this.rideRequestModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 }).lean();
    }

    async updateStatus(body: any) {
        const { bookingId, status } = body;
        if (!Types.ObjectId.isValid(bookingId)) {
            throw new Error('Invalid Booking ID');
        }
        return await this.rideRequestModel.findByIdAndUpdate(bookingId, { status }, { new: true }).lean();
    }
}
