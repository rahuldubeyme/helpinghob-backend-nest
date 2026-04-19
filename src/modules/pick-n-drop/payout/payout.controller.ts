import { Controller, Get, Post, Body, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { PayoutService } from './payout.service';
import { RequestPayoutDto } from './dto/payout.dto';
import { ApiType } from '@common/decorators';
import { PaginationDto } from '@dtos/pagination.dto';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop/driver')
export class PayoutController {
    constructor(private readonly payoutService: PayoutService) { }

    /* @Get('payout-history')
    @ApiType('provider')
    @ApiOperation({ summary: 'Get driver payout history' })
    async getPayoutHistory(@Req() req: any, @Query() query: PaginationDto) {
        return await this.payoutService.getPayoutHistory(req.user.id, query);
    }

    @Post('request-payout')
    @ApiType('provider')
    @ApiOperation({ summary: 'Request a new payout' })
    async requestPayout(@Body() body: RequestPayoutDto, @Req() req: any) {
        return await this.payoutService.requestPayout(req.user.id, body.amount);
    } */
}
