import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatMessageDocument = ChatMessage & Document;

@Schema({ collection: 'chat_messages', timestamps: true })
export class ChatMessage {
  @Prop({ type: Types.ObjectId, ref: 'ChatRoom', required: true })
  roomId: Types.ObjectId;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true, enum: ['merchant', 'vendor', 'user'] })
  senderType: string;

  @Prop({ required: true })
  message: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);
