import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { USER_ROLE } from '@common/constant';

export type ContactUsDocument = ContactUs & Document;

@Schema({ collection: 'contact_us', timestamps: true })
export class ContactUs {
  @Prop({ trim: true })
  title: string;

  @Prop()
  fullName: string;

  @Prop()
  email: string;

  @Prop()
  mobileNo: string;

  @Prop()
  message: string;

  @Prop({ required: true, enum: Object.values(USER_ROLE) })
  role: string;

  @Prop({ default: 'New' })
  status: string; // 'New' | 'Read' | 'Resolved'

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ContactUsSchema = SchemaFactory.createForClass(ContactUs);
