import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateAddressDto {
    @ApiProperty({ example: 'Home' })
    @IsString()
    addressTag: string;

    @ApiProperty({ example: '123 Main St, Springfield' })
    @IsString()
    address: string;

    @ApiProperty({ example: 'Springfield' })
    @IsString()
    city: string;

    @ApiProperty({ example: [77.1025, 28.7041], description: '[longitude, latitude]' })
    @IsArray()
    location: number[];

    @ApiPropertyOptional({ example: '62701' })
    @IsString()
    @IsOptional()
    zipcode?: string;

    @ApiPropertyOptional({ example: false })
    @IsBoolean()
    @IsOptional()
    isPrimary?: boolean;
}

export class UpdateAddressDto extends CreateAddressDto { }
