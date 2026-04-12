import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class VerifyBookingDto {
    @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000', description: 'Booking ID' })
    @IsUUID()
    @IsNotEmpty()
    bookingId: string;

    @ApiProperty({ example: '123456', description: 'OTP code for verification' })
    @IsString()
    @IsNotEmpty()
    otp: string;
}
