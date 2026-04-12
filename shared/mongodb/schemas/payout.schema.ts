import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayoutDocument = Payout & Document;

@Schema({ collection: 'payouts', timestamps: true })
export class Payout {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  driverId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: true, default: 'INR' })
  currency: string;

  @Prop({ enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Prop()
  transactionReference: string;

  @Prop()
  processedAt: Date;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const PayoutSchema = SchemaFactory.createForClass(Payout);
