import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { PaymentService } from './payment.service';
import { ProcessPaymentDto } from './dto/payment.dto';
import { ApiType } from '@common/decorators';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @Post('process-payment')
    @ApiType(['provider'])
    @ApiOperation({ summary: 'Process payment for a ride from driver' })
    async processPayment(@Body() body: ProcessPaymentDto) {
        return await this.paymentService.processPayment(body);
    }
}
