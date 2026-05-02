import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OndemandBookingDocument = OndemandBooking & Document;

@Schema({ collection: 'ondemand_bookings', timestamps: true })
export class OndemandBooking {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    providerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Service' })
    serviceId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'SubCategory' })
    subCategoryId: Types.ObjectId;

    @Prop({
        enum: ['pending', 'accepted', 'rejected', 'on_the_way', 'reached', 'started', 'completed', 'cancelled', 'disputed'],
        default: 'pending'
    })
    status: string;

    @Prop({ enum: ['immediate', 'scheduled'], default: 'immediate' })
    bookingType: string;

    @Prop()
    scheduledAt: Date;

    @Prop()
    acceptedAt: Date;

    @Prop()
    onTheWayAt: Date;

    @Prop()
    reachedAt: Date;

    @Prop()
    startedAt: Date;

    @Prop()
    completedAt: Date;

    @Prop()
    cancelledAt: Date;

    @Prop()
    otp: string;

    @Prop({ type: [String], default: [] })
    beforeImages: string[];

    @Prop({ type: [String], default: [] })
    afterImages: string[];

    @Prop({ enum: ['cash', 'upi'], default: 'cash' })
    paymentMethod: string;

    @Prop({ enum: ['pending', 'completed'], default: 'pending' })
    paymentStatus: string;

    @Prop({ default: 0 })
    amount: number;

    @Prop({ default: false })
    materialIncluded: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const OndemandBookingSchema = SchemaFactory.createForClass(OndemandBooking);
