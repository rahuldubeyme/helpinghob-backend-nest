import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { USER_ROLE } from '@common/constant';

export type StaticPagesDocument = StaticPages & Document;

@Schema({ collection: 'static_pages', timestamps: true })
export class StaticPages {
  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  slug: string;

  @Prop({ enum: Object.values(USER_ROLE) })
  role: string;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const StaticPagesSchema = SchemaFactory.createForClass(StaticPages);
