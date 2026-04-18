import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatRoomDocument = ChatRoom & Document;

@Schema({ collection: 'chat_rooms', timestamps: true })
export class ChatRoom {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ enum: ['open', 'closed'], default: 'open' })
  status: string;

  @Prop()
  lastMessage: string;

  @Prop()
  lastMessageTime: Date;

  @Prop({ default: true })
  isSuspended: boolean;

  @Prop({ default: false })
  isDeleted: boolean;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
