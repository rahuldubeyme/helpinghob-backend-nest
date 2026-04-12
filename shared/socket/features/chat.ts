import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { ChatService } from '../services/chat.service';
import { JoinRoomDto, SendMessageDto } from '../dto/chat.dto';

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatSocket {
    @WebSocketServer()
    server: Server;

    constructor(private readonly chatService: ChatService) { }

    @SubscribeMessage('join_room')
    @UsePipes(new ValidationPipe())
    async handleJoinRoom(
        @MessageBody() dto: JoinRoomDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return { success: false, message: 'Unauthorized' };

        const hasAccess = await this.chatService.validateRoomAccess(dto.roomId, user);
        if (!hasAccess) {
            return { success: false, message: 'Forbidden' };
        }

        client.join(dto.roomId);
        return { success: true, message: `Joined room ${dto.roomId}` };
    }

    @SubscribeMessage('send_message')
    @UsePipes(new ValidationPipe())
    async handleMessage(
        @MessageBody() dto: SendMessageDto,
        @ConnectedSocket() client: Socket,
    ) {
        const user = client.data.user;
        if (!user) return { success: false, message: 'Unauthorized' };

        if (dto.senderId !== user.id) {
            return { success: false, message: 'Sender ID mismatch' };
        }

        const hasAccess = await this.chatService.validateRoomAccess(dto.roomId, user);
        if (!hasAccess) {
            return { success: false, message: 'Forbidden' };
        }

        const chatMessage = await this.chatService.saveMessage(dto);
        this.server.to(dto.roomId).emit('new_message', chatMessage);

        return { success: true, data: chatMessage };
    }
}
