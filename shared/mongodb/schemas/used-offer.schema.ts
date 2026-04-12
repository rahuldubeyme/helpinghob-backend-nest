import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UsedOfferDocument = UsedOffer & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class UsedOffer {
    @Prop({ type: Types.ObjectId, ref: 'UsedItem', required: true })
    itemId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Number, required: true })
    offeredPrice: number;

    @Prop({ default: 'pending' }) // pending, accepted, rejected
    status: string;
}

export const UsedOfferSchema = SchemaFactory.createForClass(UsedOffer);
