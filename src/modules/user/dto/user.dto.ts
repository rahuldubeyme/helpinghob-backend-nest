import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';

export class UpdateProfileDto {
    @ApiPropertyOptional({ example: 'John Doe' })
    @IsString()
    @IsOptional()
    fullName?: string;

    @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiPropertyOptional({ example: 'male', enum: ['male', 'female', 'other'] })
    @IsEnum(['male', 'female', 'other'])
    @IsOptional()
    gender?: string;

    @ApiPropertyOptional({ example: '1990-01-01' })
    @IsDateString()
    @IsOptional()
    dob?: string;

    @ApiPropertyOptional({ example: 'Short bio' })
    @IsString()
    @IsOptional()
    bio?: string;
}

export class UpdateLanguageDto {
    @ApiProperty({ example: 'en', enum: ['en', 'hi'] })
    @IsEnum(['en', 'hi'])
    langauge: string;
}
