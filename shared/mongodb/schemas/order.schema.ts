import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ collection: 'orders', timestamps: true })
export class Order {
    @Prop({ required: true, unique: true })
    orderID: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop()
    deliveryAddress: string;

    @Prop({ type: [Number], index: '2dsphere', default: [0, 0] })
    deliveryLocation: number[];

    @Prop({ default: false })
    isInCart: boolean;

    @Prop({ enum: ['pending', 'preparing', 'dispatched', 'delivered', 'cancelled'], default: 'pending' })
    status: string;

    @Prop({ enum: ['pending', 'success', 'failed', 'refunded'], default: 'pending' })
    paymentStatus: string;

    @Prop({ type: Number, default: 0 })
    price: number;

    @Prop({ type: Number, default: 0 })
    grandTotal: number;

    @Prop()
    paymentMode: string;

    @Prop({ type: Types.ObjectId, ref: 'Employee' }) // Delivery partner
    partnerId: Types.ObjectId;

    @Prop({ type: Object })
    productDetails: any;

    @Prop({ type: [{ status: String, timestamp: { type: Date, default: Date.now }, meta: Object }] })
    orderActivity: any[];

    @Prop({ default: true })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
