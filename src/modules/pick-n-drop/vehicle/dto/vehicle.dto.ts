import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from '../../dto/common.dto';

export class RidePricingDto {
    @ApiProperty({ example: '69c3e6c0bfe3fe1c56ba3ead' })
    @IsNotEmpty()
    @IsString()
    vehicleId: string;

    @ApiProperty({
        type: LocationDto,
        example: {
            lat: 19.0760,
            lng: 72.8777,
            address: 'Mumbai International Airport'
        }
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    source: LocationDto;

    @ApiProperty({
        type: LocationDto,
        example: {
            lat: 18.9220,
            lng: 72.8347,
            address: 'Gateway of India, Mumbai'
        }
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    destination: LocationDto;
}
