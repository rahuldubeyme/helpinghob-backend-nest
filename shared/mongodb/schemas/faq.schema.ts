import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FaqDocument = Faq & Document;

@Schema({ timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class Faq {
    @Prop({ trim: true }) question: string;
    @Prop({ trim: true }) answer: string;
    @Prop({ default: false }) isSuspended: boolean;
    @Prop({ default: false }) isDeleted: boolean;
}

export const FaqSchema = SchemaFactory.createForClass(Faq);
