import { Controller, Get, Post, Body, Param, Query, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OndemandService } from './ondemand.service';
import { Auth, CurrentUser } from '@common/decorators';
import { USER_ROLE } from '@common/constant';

@ApiTags('On-Demand Service')
@Controller('ondemand-service')
export class OndemandServiceController {
    constructor(private readonly ondemandService: OndemandService) { }

    // ── User Endpoints ──────────────────────────────────────────────────────────

    @Get('home')
    @ApiOperation({ summary: 'Home: Get categories and top providers' })
    getHomeData() {
        return this.ondemandService.getHomeData();
    }

    @Get('providers')
    @ApiOperation({ summary: 'List service providers with filters' })
    getProviders(@Query() query: any) {
        return this.ondemandService.getServiceProviders(query);
    }

    @Get('provider/:id')
    @ApiOperation({ summary: 'Get provider details with services and reviews' })
    getProviderDetails(@Param('id') id: string) {
        return this.ondemandService.getProviderDetails(id);
    }

    @Get('provider/:id/reviews')
    @ApiOperation({ summary: 'Get all reviews for a specific provider' })
    getProviderReviews(@Param('id') id: string, @Query() query: any) {
        return this.ondemandService.getProviderReviews(id, query);
    }
}
