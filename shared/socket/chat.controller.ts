import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiType, Auth, CurrentUser } from '@common/decorators';
import { ROLE, USER_ROLE } from '@common/constant';
import { ChatService } from './services/chat.service';
import { ChatHistoryQueryDto } from './dto/chat.dto';

@ApiTags('Chat Support')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @Get('create-room')
    @ApiOperation({ summary: 'Get or create his chat room with othe user' })
    getMerchantRoom(@CurrentUser() user: any) {
        return this.chatService.getOrCreateRoom(user.id);
    }

    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @Get('rooms')
    @ApiOperation({ summary: 'List all chat rooms' })
    getAdminRooms() {
        return this.chatService.getRooms();
    }

    @Get('messages/:roomId')
    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @ApiOperation({ summary: 'Get chat message history for a room' })
    getRoomMessages(
        @Param('roomId') roomId: string,
        @Query() query: ChatHistoryQueryDto,
    ) {
        return this.chatService.getRoomMessages(roomId, query);
    }

    @Patch('close/:roomId')
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @ApiOperation({ summary: 'Close a chat room session' })
    closeRoom(@Param('roomId') roomId: string) {
        return this.chatService.closeRoom(roomId);
    }
}
