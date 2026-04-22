import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LiveLocationDocument = LiveLocation & Document;

@Schema({ collection: 'live_locations', timestamps: true })
export class LiveLocation {
    @Prop({ type: Types.ObjectId, required: true, ref: 'User', index: true })
    userId: Types.ObjectId;

    @Prop({ required: true, index: true })
    role: string; // provider, grocery, etc.

    @Prop({
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],
            index: '2dsphere',
        },
    })
    location: {
        type: string;
        coordinates: number[];
    };

    @Prop({ default: Date.now })
    lastUpdate: Date;
}

export const LiveLocationSchema = SchemaFactory.createForClass(LiveLocation);
LiveLocationSchema.index({ location: '2dsphere' });
LiveLocationSchema.index({ userId: 1 });
