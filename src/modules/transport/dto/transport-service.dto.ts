import { ApiProperty } from '@nestjs/swagger';

export class TransportRideDto {
    @ApiProperty()
    pickupLocation: {
        lat: number;
        lng: number;
        address: string;
    };

    @ApiProperty()
    dropLocation: {
        lat: number;
        lng: number;
        address: string;
    };

    @ApiProperty()
    vehicleType: string;

    @ApiProperty({ required: false })
    weight?: number;

    @ApiProperty({ required: false })
    notes?: string;

    @ApiProperty({ required: false })
    paymentMethod?: string;
}

export class RideStatusUpdateDto {
    @ApiProperty()
    bookingId: string;

    @ApiProperty({ enum: ['STARTED', 'REACHED', 'COMPLETED', 'CANCELLED'] })
    status: string;
}
