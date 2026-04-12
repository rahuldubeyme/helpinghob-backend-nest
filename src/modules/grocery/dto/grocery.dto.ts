import { ApiProperty } from '@nestjs/swagger';

export class GroceryOrderDto {
    @ApiProperty()
    shopId: string;

    @ApiProperty({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                productId: { type: 'string' },
                quantity: { type: 'integer' },
                price: { type: 'number' },
            },
        },
    })
    items: any[];

    @ApiProperty()
    deliveryAddress: {
        lat: number;
        lng: number;
        address: string;
    };

    @ApiProperty({ required: false })
    couponCode?: string;

    @ApiProperty({ required: false })
    paymentMethod?: string;
}

export class ApplyCouponDto {
    @ApiProperty()
    couponCode: string;

    @ApiProperty()
    totalAmount: number;
}
