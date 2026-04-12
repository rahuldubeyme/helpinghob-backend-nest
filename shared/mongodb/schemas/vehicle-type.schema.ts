import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VehicleTypeDocument = VehicleType & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class VehicleType {
    @Prop() icon: string;
    @Prop({ trim: true }) type: string;   // car, bike, auto
    @Prop({ trim: true }) title: string;
    @Prop({ default: 1 }) capacity: number;
    @Prop({ default: 0 }) baseFare: number;
    @Prop({ default: 0 }) perKmRate: number;
    @Prop({ default: 0 }) minimumFare: number;
    @Prop({ default: 0 }) cancellationFee: number;
    @Prop({ default: false }) isSuspended: boolean;
    @Prop({ default: false }) isDeleted: boolean;
}

export const VehicleTypeSchema = SchemaFactory.createForClass(VehicleType);
