import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiType, Auth, CurrentUser } from '@common/decorators';
import { ROLE, USER_ROLE } from '@common/constant';
import { ChatService } from './services/chat.service';
import { AssignSubAdminDto, ChatHistoryQueryDto, RoomQueryDto } from './dto/chat.dto';

@ApiTags('Chat Support')
@Controller('chat')
export class ChatController {
    constructor(private readonly chatService: ChatService) { }

    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @Get('merchant/room')
    @ApiOperation({ summary: 'Merchant: Get or create his chat room with admin' })
    getMerchantRoom(@CurrentUser() user: any) {
        return this.chatService.getOrCreateRoom(user.id);
    }

    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @Get('admin/rooms')
    @ApiOperation({ summary: 'Admin: List all chat rooms (can filter by assigned sub-admin)' })
    getAdminRooms(@Query() query: RoomQueryDto) {
        return this.chatService.getAdminRooms(query);
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

    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @Post('assign')
    @ApiOperation({ summary: 'Super Admin: Assign a sub-admin/staff to handle a merchant chat' })
    assignSubAdmin(
        @Body() dto: AssignSubAdminDto
    ) {
        return this.chatService.assignSubAdmin(dto.roomId, dto.subAdminId);
    }

    @Patch('close/:roomId')
    @Auth(ROLE.USER, USER_ROLE.PROVIDER)
    @ApiOperation({ summary: 'Close a chat room session' })
    closeRoom(@Param('roomId') roomId: string) {
        return this.chatService.closeRoom(roomId);
    }
}
