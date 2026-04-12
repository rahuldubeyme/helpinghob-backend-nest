import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AdminSettingDocument = AdminSetting & Document;

@Schema({ collection: 'admin_settings', timestamps: true })
export class AdminSetting {
  @Prop()
  androidAppVersion: string;

  @Prop({ default: true })
  androidForceUpdate: boolean;

  @Prop()
  androidAppLink: string;

  @Prop({ default: true })
  maintenanceMode: boolean;

  @Prop({ default: 0 })
  platformFee: number;

  @Prop({ default: 0 })
  bookingFee: number;

  @Prop({ default: 0 })
  transactionFee: number;

  @Prop({ default: 0 })
  commission: number;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ default: '' })
  googleMapsApiKey: string;

  @Prop({ type: Object, default: { ridesThreshold: 4, amount: 5 } })
  pickNDropIncentive: {
    ridesThreshold: number;
    amount: number;
  };
}

export const AdminSettingSchema = SchemaFactory.createForClass(AdminSetting);
