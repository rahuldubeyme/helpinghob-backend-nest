import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type     RideRequestDocument = RideRequest & Document;

@Schema({ collection: 'ride_requests', timestamps: true })
export class RideRequest {
    @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
    vehicleId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User' })
    driverId: Types.ObjectId;

    @Prop({ type: Object })
    source: {
        address: string;
        location: {
            type: string,
            coordinates: number[]
        };
        label: string;
    };

    @Prop({ type: Object })
    destination: {
        status: string,
        address: string;
        location: {
            type: string,
            coordinates: number[]
        };
        label: string;
    };

    @Prop({ type: Object })
    price: {
        baseFare: number;
        distanceFare: number;
        totalFare: number;
        currency: string;
    };

    @Prop()
    estimatedDistance: number; // in meters

    @Prop()
    estimatedDuration: number; // in seconds

    @Prop({ enum: ['pending', 'accepted', 'rejected'], default: 'pending' })
    requestStatus: string;

    @Prop({ enum: ['pending', 'on_the_way', 'reached', 'started', 'completed', 'cancelled'], default: 'pending' })
    status: string;

    @Prop()
    reachedPickupAt: Date;

    @Prop({ type: [{ address: String, location: Object, changedAt: { type: Date, default: Date.now } }] })
    destinationHistory: any[];


    @Prop({ default: false })
    isDisputed: boolean;

    @Prop({ type: [{ reporterId: { type: Types.ObjectId, ref: 'User' }, reason: String, description: String, status: { type: String, default: 'open' }, createdAt: { type: Date, default: Date.now } }] })
    disputes: any[];

    @Prop({ type: [{ lat: Number, lng: Number, timestamp: { type: Date, default: Date.now } }] })
    locationUpdates: any[];

    @Prop()
    pickupOtp: string;

    @Prop({ default: '' })
    cancelledBy: string;

    @Prop()
    cancellationReason: string;

    @Prop()
    cancelledRideAt: Date;

    @Prop({ enum: ['CASH', 'ONLINE', 'WALLET'], default: 'CASH' })
    paymentMethod: string;

    @Prop({ enum: ['pending', 'paid', 'failed'], default: 'pending' })
    paymentStatus: string;

    @Prop({ type: [{ driverId: Types.ObjectId, status: String, respondedAt: Date }] })
    driverResponses: any[];

    @Prop({ default: false })
    isDeleted: boolean;
}

export const RideRequestSchema = SchemaFactory.createForClass(RideRequest);
