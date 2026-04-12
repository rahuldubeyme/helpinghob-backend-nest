import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EducationInquiryDocument = EducationInquiry & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class EducationInquiry {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Institution', required: true, index: true })
    institutionId: Types.ObjectId;

    @Prop({ required: true })
    query: string;

    @Prop()
    reply: string;

    @Prop({ enum: ['pending', 'responded'], default: 'pending' })
    status: string;
}

export const EducationInquirySchema = SchemaFactory.createForClass(EducationInquiry);
