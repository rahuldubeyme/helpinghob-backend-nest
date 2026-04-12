import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class Coupon {
    @Prop({ trim: true, required: true, unique: true })
    code: string;

    @Prop({ required: true })
    value: number;

    @Prop()
    minPrice: number;

    @Prop()
    maxDiscount: number;

    @Prop()
    noOfTimes: number;

    @Prop({ enum: ["percentage", "fixed"], default: "fixed" })
    type: string;

    @Prop({ required: true })
    startDate: Date;

    @Prop({ required: true })
    endDate: Date;

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
