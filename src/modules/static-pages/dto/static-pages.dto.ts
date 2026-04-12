import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateStaticPagesDto {
    @ApiProperty() @IsString() title: string;
    @ApiProperty() @IsString() slug: string;
    @ApiProperty() @IsString() content: string;
    @ApiPropertyOptional() @IsString() @IsOptional() role?: string;
}

export class UpdateStaticPagesDto {
    @ApiPropertyOptional() @IsString() @IsOptional() title?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() content?: string;
}
