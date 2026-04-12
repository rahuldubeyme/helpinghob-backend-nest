import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min } from 'class-validator';
import { PaginationDto } from '../../used-cart/dto/used-cart.dto';

export class InstitutionQueryDto extends PaginationDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string; // coaching, music, dance, etc.

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    maxFee?: string;
}

export class CreateEducationInquiryDto {
    @ApiProperty({ example: '60f1...' })
    @IsString()
    institutionId: string;

    @ApiProperty({ example: 'I want to know about the admission process for the 2024 batch.' })
    @IsString()
    query: string;
}

export class ReplyInquiryDto {
    @ApiProperty({ example: 'Admissions are open until June 30th. Please visit our website for details.' })
    @IsString()
    reply: string;
}
