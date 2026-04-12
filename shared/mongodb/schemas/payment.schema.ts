import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class Payment {
    @Prop({ required: true, enum: ['Booking', 'Subscription'] })
    type: string;

    @Prop({ required: true, enum: ['PAID', 'FREE'] })
    payType: string;

    @Prop({ enum: ["pending", "success", "failed", "refund", "canceled"], default: "pending" })
    payment_status: string;

    @Prop()
    transactionId: string;

    @Prop({ type: MongooseSchema.Types.Mixed })
    tarnsaction_data: any;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    user: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Booking' })
    bookingId: Types.ObjectId;

    @Prop({ required: true })
    amount: number;

    @Prop({ required: true })
    grandTotal: number;

    @Prop()
    payment_method: string;

    @Prop()
    transaction_type: string;

    @Prop({ type: [MongooseSchema.Types.Mixed] })
    paymentInfo: any[];

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
