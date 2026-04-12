import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({
    collection: 'categories',
    timestamps: true,
})
export class Category {

    @Prop({
        type: Types.ObjectId,
        ref: 'MasterService',
        required: true,
        index: true,
    })
    masterServiceId: Types.ObjectId;

    @Prop()
    icon: string;

    @Prop({ default: false })
    emergencyServices: boolean;

    @Prop({ trim: true })
    type: string;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ default: false })
    isFeatured: boolean;

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const CategorySchema =
    SchemaFactory.createForClass(Category);