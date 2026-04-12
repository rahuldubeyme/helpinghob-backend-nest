import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EarningDocument = Earning & Document;

@Schema({ collection: 'earnings', timestamps: true })
export class Earning {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    providerId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'OndemandBooking', required: true })
    bookingId: Types.ObjectId;

    @Prop({ default: 0 })
    amount: number;

    @Prop({ default: 0 })
    adminCommission: number;

    @Prop({ default: 0 })
    netEarning: number;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const EarningSchema = SchemaFactory.createForClass(Earning);
