import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ServiceCategoryDocument = ServiceCategory & Document;

@Schema({ collection: 'servicecategories', timestamps: true })
export class ServiceCategory {
    @Prop({ type: Number, required: true, index: true })
    masterServiceId: number;

    @Prop() icon: string;
    @Prop({ default: false }) emergencyServices: boolean;
    @Prop() type: string;
    @Prop({ required: true, trim: true }) title: string;
    @Prop({ default: false }) isFeatured: boolean;
    @Prop({ default: false }) isSuspended: boolean;
    @Prop({ default: false }) isDeleted: boolean;
}

export const ServiceCategorySchema = SchemaFactory.createForClass(ServiceCategory);
