import { Controller, Get, Post, Body, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { PayoutService } from './payout.service';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop/driver')
export class PayoutController {
    constructor(private readonly payoutService: PayoutService) { }

    @Get('payout-history')
    @ApiOperation({ summary: 'Get driver payout history' })
    async getPayoutHistory(@Req() req: any) {
        return await this.payoutService.getPayoutHistory(req.user.id);
    }

    @Post('request-payout')
    @ApiOperation({ summary: 'Request a new payout' })
    async requestPayout(@Body('amount') amount: number, @Req() req: any) {
        return await this.payoutService.requestPayout(req.user.id, amount);
    }
}
