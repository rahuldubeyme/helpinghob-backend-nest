import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class MerchantBookingListDto {
    @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
    @ApiPropertyOptional() @IsOptional() skip?: number;
    @ApiPropertyOptional() @IsOptional() limit?: number;
    @ApiPropertyOptional() @IsOptional() pagination?: boolean;
    @ApiPropertyOptional() @IsUUID() @IsOptional() serviceId?: string;
    @ApiPropertyOptional() @IsUUID() @IsOptional() categoryId?: string;
    @ApiPropertyOptional({ enum: ['pending', 'confirmed', 'completed', 'cancelled'] })
    @IsEnum(['pending', 'confirmed', 'completed', 'cancelled']) @IsOptional() bookingStatus?: string;
}

export class MerchantVerifyOtpDto {
    @ApiProperty({ example: '1234' }) @IsString() @IsNotEmpty() otp: string;
}

export class UpdateBookingStatusDto {
    @ApiProperty({ enum: ['confirmed', 'completed', 'cancelled'] })
    @IsEnum(['confirmed', 'completed', 'cancelled']) @IsNotEmpty() status: string;
}
