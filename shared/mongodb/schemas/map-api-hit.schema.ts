import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MapApiHitDocument = MapApiHit & Document;

@Schema({ collection: 'map_api_hits', timestamps: true })
export class MapApiHit {
    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    userId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', index: true })
    providerId?: Types.ObjectId;

    @Prop({ type: Types.ObjectId, required: false, index: true })
    referenceId?: Types.ObjectId; // generic ID (rideId, orderId, etc.)

    @Prop({ required: true, index: true })
    moduleType: string; // pick-n-drop, grocery, hardware-shop, etc.

    @Prop({ required: true })
    apiType: string; // distance_matrix, directions, etc.

    @Prop({ type: Object })
    params: any;

    @Prop({ default: 1 })
    count: number;
}

export const MapApiHitSchema = SchemaFactory.createForClass(MapApiHit);
MapApiHitSchema.index({ createdAt: -1 });
