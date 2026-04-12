import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BannerDocument = Banner & Document;

@Schema({ collection: 'banners', timestamps: true })
export class Banner {
  @Prop()
  title: string;

  @Prop()
  banner: string;

  @Prop()
  internal_url: string;

  @Prop()
  external_url: string;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const BannerSchema = SchemaFactory.createForClass(Banner);
