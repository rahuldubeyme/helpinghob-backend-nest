import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UsedItemDocument = UsedItem & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class UsedItem {
    @Prop({ type: Number, required: true, index: true })
    masterServiceId: number; // references MasterService.serviceId (e.g. 1001)

    @Prop({ type: Types.ObjectId, ref: 'ServiceCategory' })
    categoryId: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'SubCategory' }] })
    subCategoryId: Types.ObjectId[];

    @Prop({ type: [{ type: Types.ObjectId, ref: 'Service' }] })
    serviceId: Types.ObjectId[];

    @Prop() category: string;       // mobile, car, furniture, etc.
    @Prop({ type: [String] }) images: string[];
    @Prop() title: string;
    @Prop() description: string;
    @Prop() actualPrice: string;
    @Prop() expectedPrice: string;
    @Prop({ type: [Number] }) location: number[];
    @Prop() address: string;
    @Prop() yearOfPurchase: string;
    @Prop() condition: string;      // new, old, used, like-new
    @Prop() brand: string;
    @Prop() model: string;
    @Prop({ type: [String] }) specifications: string[];

    @Prop({ type: Types.ObjectId, ref: 'User' })
    userId: Types.ObjectId;

    @Prop({ default: false }) isSold: boolean;
    @Prop({ default: false }) isFeatured: boolean;
    @Prop({ default: false }) isSuspended: boolean;
    @Prop({ default: false }) isDeleted: boolean;
}

export const UsedItemSchema = SchemaFactory.createForClass(UsedItem);
