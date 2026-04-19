import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateAvailabilityDto {
    @ApiProperty({ example: 'Online', enum: ['Online', 'Offline', 'Busy'] })
    @IsNotEmpty()
    @IsString()
    availability: string;
}

export class UpdateDriverLocationDto {
    @ApiProperty({ example: 19.076 })
    @IsNotEmpty()
    @IsNumber()
    lat: number;

    @ApiProperty({ example: 72.8777 })
    @IsNotEmpty()
    @IsNumber()
    lng: number;

    @ApiProperty({ example: '65c3e6c0bfe3fe1c56ba3ead', required: false })
    @IsOptional()
    @IsString()
    rideId?: string;
}
