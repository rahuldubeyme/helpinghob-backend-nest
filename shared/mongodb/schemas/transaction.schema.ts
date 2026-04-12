import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ collection: 'transactions', timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true })
  walletId: Types.ObjectId;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ enum: ['used', 'unused'], default: 'unused' })
  usedStatus: string;

  @Prop({ required: true, enum: ['credit', 'debit'] })
  type: string;

  @Prop({ enum: ['pending', 'success', 'failed'], default: 'pending' })
  status: string;

  @Prop({ required: true })
  category: string; // 'booking' | 'topup' | 'payout' | 'refund'

  @Prop()
  referenceId: string;

  @Prop()
  description: string;

  @Prop()
  validStartDate: Date;

  @Prop()
  validEndDate: Date;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
