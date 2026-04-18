import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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

export class RidePricingDto {
    @ApiProperty({ type: LocationDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    source: LocationDto;

    @ApiProperty({ type: LocationDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    destination: LocationDto;
}

export class BookRideDto {
    @ApiProperty({ type: LocationDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    source: LocationDto;

    @ApiProperty({ type: LocationDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    destination: LocationDto;

    @ApiProperty({ example: '65c3e6c0bfe3fe1c56ba3ead' })
    @IsNotEmpty()
    @IsString()
    vehicleId: string;

    @ApiProperty({ example: '65c3e6c0bfe3fe1c56ba3eaf' })
    @IsNotEmpty()
    @IsString()
    driverId: string;

    @ApiProperty({ example: 250 })
    @IsNotEmpty()
    @IsNumber()
    totalFare: number;
}
