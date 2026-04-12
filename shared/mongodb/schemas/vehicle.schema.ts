import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VehicleDocument = Vehicle & Document;

@Schema({ collection: 'vehicles', timestamps: true })
export class Vehicle {
    @Prop()
    icon: string;

    @Prop({ trim: true })
    type: string; // car/bike/auto

    @Prop({ trim: true })
    model: string;

    @Prop({ trim: true })
    numberPlate: string;

    @Prop({ trim: true })
    color: string;

    @Prop({ trim: true })
    title: string;

    @Prop({ default: 1 })
    capacity: number;

    @Prop({ default: 0 })
    baseFare: number;

    @Prop({ default: 0 })
    perKmRate: number;

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);
