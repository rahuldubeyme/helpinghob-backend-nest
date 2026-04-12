import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class BussinessCategoryDto {
    @ApiProperty({ example: 'Salon', description: 'The name of the business category' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: true, description: 'Whether the category is active', required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}

export class UpdateBussinessCategoryDto extends PartialType(BussinessCategoryDto) { }
