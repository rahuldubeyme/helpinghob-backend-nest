import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ collection: 'products', timestamps: true })
export class Product {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ trim: true })
    description: string;

    @Prop({ trim: true })
    unit: string; // kg, mg, lt, etc.

    @Prop({ trim: true })
    quantity: string;

    @Prop({ type: [String] })
    images: string[];

    @Prop({ type: Number, default: 0 })
    price: number;

    @Prop({ type: Number, default: 0 })
    discount: number;

    @Prop({ type: Number, default: 0 })
    lastPrice: number;

    @Prop({ default: true })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
