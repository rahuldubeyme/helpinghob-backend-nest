import { ApiProperty } from '@nestjs/swagger';

export class RestaurantFilterDto {
    @ApiProperty({ required: false })
    categoryId?: string;

    @ApiProperty({ required: false })
    search?: string;

    @ApiProperty({ required: false })
    lat?: number;

    @ApiProperty({ required: false })
    lng?: number;

    @ApiProperty({ default: 1 })
    page: number;

    @ApiProperty({ default: 10 })
    perPage: number;
}

export class FoodOrderDto {
    @ApiProperty()
    restaurantId: string;

    @ApiProperty({ type: 'array', items: { type: 'object' } })
    items: any[];

    @ApiProperty()
    deliveryAddress: {
        lat: number;
        lng: number;
        address: string;
    };

    @ApiProperty({ required: false })
    couponCode?: string;

    @ApiProperty()
    paymentMethod: string;
}
