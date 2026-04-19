import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/payment.dto';
import { ApiType } from '@common/decorators';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop/ride')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    /* @Post(':id/payment')
    @ApiType(['user', 'provider'])
    @ApiOperation({ summary: 'Process payment for a ride' })
    async processPayment(@Param('id') rideId: string, @Body() body: ProcessPaymentDto) {
        return await this.paymentService.processPayment(rideId, body.method);
    } */
}
