import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

@Schema({ collection: 'bookings', timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  providerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: false })
  categoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'SubCategory', required: false })
  subCategoryId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Service', required: false })
  serviceId: Types.ObjectId;

  @Prop({ required: true })
  bookingDate: Date;

  @Prop({ enum: ['pending', 'confirmed', 'completed', 'cancelled', 'disputed'], default: 'pending' })
  status: string;

  @Prop()
  otp: string;

  @Prop({ required: true, type: Number })
  total: number;

  @Prop({ required: true, type: Number })
  grandTotal: number;

  @Prop({ required: true, type: Number })
  tax: number; 

  @Prop() //cash - online
  paymentMethod: string;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
