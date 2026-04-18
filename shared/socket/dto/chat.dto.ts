import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class SendMessageDto {
    @ApiProperty({ example: '60f1...' })
    @IsString()
    roomId: string;

    @ApiProperty({ example: '60f1...' })
    @IsString()
    senderId: string;

    @ApiProperty({ enum: ['user', 'provider', 'admin'] })
    @IsEnum(['user', 'provider', 'admin'])
    senderType: string;

    @ApiProperty({ example: 'Hello, how can I help you?' })
    @IsString()
    message: string;
}

export class JoinRoomDto {
    @ApiProperty({ example: '60f1...' })
    @IsString()
    roomId: string;
}

export class ChatHistoryQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    offset?: number;
}


export class AssignSubAdminDto {
    @ApiProperty()
    @IsString()
    roomId: string;

    @ApiProperty()
    @IsString()
    subAdminId: string;
}
