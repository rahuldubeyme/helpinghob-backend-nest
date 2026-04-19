import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class LocationDto {
    @ApiProperty({ example: 19.076 })
    @IsNotEmpty()
    @IsNumber()
    lat: number;

    @ApiProperty({ example: 72.8777 })
    @IsNotEmpty()
    @IsNumber()
    lng: number;

    @ApiProperty({ required: false, example: '123 Main St, Mumbai' })
    @IsOptional()
    @IsString()
    address?: string;
}
