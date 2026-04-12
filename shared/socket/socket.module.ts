import { Module, Global, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { PickNDropSocket } from './features/pick-n-drop';
import { ChatSocket } from './features/chat';
import { PickNDropModule } from '../../src/modules/pick-n-drop/pick-n-drop.module';
import { ChatService } from './services/chat.service';
import { ChatController } from './chat.controller';
import { Chat, ChatSchema } from '@mongodb/schemas/chat.schema';
import { ChatMessage, ChatMessageSchema } from '@mongodb/schemas/chat-message.schema';
import { ChatRoom, ChatRoomSchema } from '@mongodb/schemas/chat-room.schema';
import { User, UserSchema } from '@mongodb/schemas/user.schema';

@Global()
@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Chat.name, schema: ChatSchema },
            { name: ChatMessage.name, schema: ChatMessageSchema },
            { name: ChatRoom.name, schema: ChatRoomSchema },
            { name: User.name, schema: UserSchema },
        ]),
        forwardRef(() => PickNDropModule),
    ],
    controllers: [ChatController],
    providers: [SocketGateway, SocketService, PickNDropSocket, ChatSocket, ChatService],
    exports: [SocketGateway, SocketService, ChatService],
})
export class SocketModule { }
