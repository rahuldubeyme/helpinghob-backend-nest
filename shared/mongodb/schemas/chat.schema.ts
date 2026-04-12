import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ collection: 'chats', timestamps: true })
export class Chat {
  @Prop({ required: true })
  initiatorId: string;

  @Prop({ required: true })
  initiatorType: string; // 'user' | 'merchant'

  @Prop({ required: true })
  receiverId: string;

  @Prop({ required: true })
  receiverType: string;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
