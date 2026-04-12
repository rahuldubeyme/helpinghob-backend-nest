import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
    @ApiProperty()
    spId: string;

    @ApiProperty()
    categoryId: string;

    @ApiProperty({ example: '2024-05-20' })
    scheduledDate: string;

    @ApiProperty({ example: '10:00 AM' })
    scheduledTime: string;

    @ApiProperty()
    serviceAddress: {
        lat: number;
        lng: number;
        address: string;
    };

    @ApiProperty({ required: false })
    notes?: string;

    @ApiProperty({ required: false })
    couponCode?: string;

    @ApiProperty({ required: false })
    paymentMethod?: string;
}

export class RatingReviewDto {
    @ApiProperty()
    bookingId: string;

    @ApiProperty()
    spId: string;

    @ApiProperty({ minimum: 1, maximum: 5 })
    rating: number;

    @ApiProperty({ required: false })
    review?: string;
}

export class DisputeDto {
    @ApiProperty()
    bookingId: string;

    @ApiProperty()
    reason: string;

    @ApiProperty({ required: false })
    description?: string;

    @ApiProperty({ type: [String], required: false })
    attachments?: string[];
}
