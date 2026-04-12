import { ApiProperty } from '@nestjs/swagger';

export class HardwareAddToCartDto {
    @ApiProperty()
    productId: string;

    @ApiProperty()
    shopId: string;

    @ApiProperty({ minimum: 1 })
    quantity: number;

    @ApiProperty({ required: false })
    variantId?: string;
}

export class HardwareUpdateCartDto {
    @ApiProperty()
    productId: string;

    @ApiProperty({ minimum: 0, description: 'Set to 0 to remove item' })
    quantity: number;
}

export class CreateHardwareOrderDto {
    @ApiProperty()
    shopId: string;

    @ApiProperty()
    deliveryAddress: {
        addressLine: string;
        city: string;
        lat: number;
        lng: number;
    };

    @ApiProperty({ type: 'array', items: { type: 'object' } })
    items: any[];

    @ApiProperty({ required: false })
    couponCode?: string;

    @ApiProperty({ required: false })
    scheduleTime?: string;

    @ApiProperty({ required: false })
    specialInstructions?: string;
}

export class HardwarePayDto {
    @ApiProperty()
    orderId: string;

    @ApiProperty({ enum: ['cash', 'card', 'wallet', 'upi'] })
    paymentMethod: string;

    @ApiProperty({ required: false })
    couponCode?: string;

    @ApiProperty({ required: false })
    walletAmount?: number;
}
