import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SuperAdminDocument = SuperAdmin & Document;

@Schema({ collection: 'super_admins', timestamps: true })
export class SuperAdmin {
  @Prop({ type: String, default: 'superadmin' })
  role: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  countryCode: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const SuperAdminSchema = SchemaFactory.createForClass(SuperAdmin);
