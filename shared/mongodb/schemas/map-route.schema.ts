import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MapRouteDocument = MapRoute & Document;

@Schema({ collection: 'map_routes', timestamps: true })
export class MapRoute {
    @Prop({ required: true, index: true })
    routeKey: string;

    @Prop({ required: true, type: Object })
    origin: { lat: number; lng: number };

    @Prop({ required: true, type: Object })
    destination: { lat: number; lng: number };

    @Prop({ required: true })
    distance: number;

    @Prop({ required: true })
    duration: number;

    @Prop()
    polyline?: string;

    @Prop({ type: Date, expires: 86400 * 30 }) // Expire after 30 days
    createdAt: Date;
}

export const MapRouteSchema = SchemaFactory.createForClass(MapRoute);
