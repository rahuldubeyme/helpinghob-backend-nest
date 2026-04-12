import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ZoneDocument = Zone & Document;

class GeoPoint {
    @Prop({ min: -90, max: 90 }) latitude: number;
    @Prop({ min: -180, max: 180 }) longitude: number;
}

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class Zone {
    @Prop({ required: true, trim: true }) name: string;
    @Prop({ trim: true }) description: string;

    @Prop({ enum: ['CIRCLE', 'POLYGON'], default: 'CIRCLE' })
    type: string;

    @Prop({ type: GeoPoint })
    center: GeoPoint;

    @Prop({ min: 0 }) radius: number;

    @Prop({ type: [GeoPoint] })
    boundaries: GeoPoint[];

    @Prop({ default: true }) isSuspended: boolean;
    @Prop({ default: false }) isDeleted: boolean;
}

export const ZoneSchema = SchemaFactory.createForClass(Zone);
