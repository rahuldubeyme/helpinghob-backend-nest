import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { USER_ROLE } from '@common/constant';

export type NotificationDocument = Notification & Document;

@Schema({ collection: 'notifications', timestamps: true })
export class Notification {
  @Prop({ enum: Object.values(USER_ROLE) })
  senderType: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  receiverId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @Prop() // Genereal Broadcast
  type: string; 

  @Prop()
  referenceId: string;

  @Prop()
  title: string;

  @Prop()
  description: string;

  @Prop()
  readAt: Date;
  metaData: object;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
