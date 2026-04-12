import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChatCacheDocument = ChatCache & Document;

@Schema({ collection: 'chatCaches', timestamps: { createdAt: 'created', updatedAt: 'updated' } })
export class ChatCache {
    @Prop({ type: Types.ObjectId, ref: 'Booking' }) bookingId: Types.ObjectId;
    @Prop({ type: Types.ObjectId, ref: 'Group', required: true }) group: Types.ObjectId;
    @Prop({ trim: true, required: true }) lastMessage: string;
    @Prop({ type: Types.ObjectId, ref: 'User', required: true }) lastMessageBy: Types.ObjectId;
    @Prop({ required: true }) lastMessageAt: Date;
    @Prop({ enum: ['text', 'image', 'video'], required: true }) messageType: string;
    @Prop({ trim: true }) thumbnail: string;
    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] }) deletedBy: Types.ObjectId[];
}

export const ChatCacheSchema = SchemaFactory.createForClass(ChatCache);
