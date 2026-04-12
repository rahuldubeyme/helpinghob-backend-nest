import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubCategoryDocument = SubCategory & Document;

@Schema({ collection: 'subcategories', timestamps: true })
export class SubCategory {
    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: Types.ObjectId;

    @Prop({ required: true, trim: true })
    title: string;

    @Prop()
    description: string;

    @Prop({ default: false })
    isSuspended: boolean;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const SubCategorySchema = SchemaFactory.createForClass(SubCategory);
