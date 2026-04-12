import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
    @ApiProperty({ example: 19.076 })
    lat: number;

    @ApiProperty({ example: 72.8777 })
    lng: number;

    @ApiProperty({ required: false })
    address?: string;
}

export class RidePricingDto {
    @ApiProperty()
    source: LocationDto;

    @ApiProperty()
    destination: LocationDto;
}

export class BookRideDto {
    @ApiProperty()
    source: LocationDto;

    @ApiProperty()
    destination: LocationDto;

    @ApiProperty()
    vehicleId: string;

    @ApiProperty()
    driverId: string;

    @ApiProperty()
    totalFare: number;
}
