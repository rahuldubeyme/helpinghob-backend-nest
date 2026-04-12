import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ServiceDocument = Service & Document;

@Schema({ collection: 'services', timestamps: true })
export class Service {
    @Prop({ type: Types.ObjectId, ref: 'ServiceCategory' }) categoryId: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'SubCategory' }) subCategoryId: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'User' }) serviceProviderId: Types.ObjectId;
    @Prop() title: string;
    @Prop() description: string;
    @Prop({ default: 0 }) price: number;
    @Prop({ default: false }) isDeleted: boolean;
    @Prop({ default: true }) isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
