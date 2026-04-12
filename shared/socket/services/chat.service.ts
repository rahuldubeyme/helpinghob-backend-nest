import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from '@mongodb/schemas/chat.schema';
import { ChatMessage, ChatMessageDocument } from '@mongodb/schemas/chat-message.schema';
import { ChatRoom, ChatRoomDocument } from '@mongodb/schemas/chat-room.schema';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { ChatHistoryQueryDto, RoomQueryDto, SendMessageDto } from '../dto/chat.dto';

@Injectable()
export class ChatService {
    constructor(
        @InjectModel(Chat.name) private readonly chatModel: Model<ChatDocument>,
        @InjectModel(ChatMessage.name) private readonly messageModel: Model<ChatMessageDocument>,
        @InjectModel(ChatRoom.name) private readonly roomModel: Model<ChatRoomDocument>,
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    async getOrCreateRoom(userId: string) {
        let room: any = await this.roomModel.findOne({ userId: new Types.ObjectId(userId), isDeleted: false }).lean();
        if (!room) room = (await this.roomModel.create({ userId: new Types.ObjectId(userId) })).toObject();
        return room;
    }

    async saveMessage(dto: SendMessageDto) {
        const room = await this.roomModel.findById(dto.roomId);
        if (!room) throw new NotFoundException('Chat room not found');
        return this.messageModel.create({
            roomId: new Types.ObjectId(dto.roomId),
            senderId: new Types.ObjectId(dto.senderId),
            senderType: dto.senderType,
            message: dto.message,
        });
    }

    async getRoomMessages(roomId: string, query: ChatHistoryQueryDto) {
        return this.messageModel.find({ roomId: new Types.ObjectId(roomId), isDeleted: false })
            .limit(query.limit || 50)
            .skip(query.offset || 0)
            .sort({ createdAt: -1 })
            .lean();
    }

    async getAdminRooms(query: RoomQueryDto) {
        return this.roomModel.find({ isDeleted: false }).sort({ updatedAt: -1 }).lean();
    }

    async closeRoom(roomId: string) {
        await this.roomModel.findByIdAndUpdate(roomId, { $set: { status: 'closed' } });
        return { success: true };
    }

    async assignSubAdmin(roomId: string, subAdminId: string) {
        await this.roomModel.findByIdAndUpdate(roomId, { $set: { assignedSubAdminId: subAdminId } });
        return { success: true };
    }

    async validateRoomAccess(roomId: string, user: any): Promise<boolean> {
        const room = await this.roomModel.findById(roomId).lean();
        if (!room) return false;
        if (user.role === 'admin') return true;
        return true;
    }
}
