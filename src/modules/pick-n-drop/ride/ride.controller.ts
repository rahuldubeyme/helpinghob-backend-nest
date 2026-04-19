import { Controller, Get, Post, Patch, Body, Param, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { RideService } from './ride.service';
import { CreateRideDto, UpdateRideStatusDto, VerifyOtpDto, ChangeDestinationDto, CancelRideDto, ReportDisputeDto, SubmitReviewDto, RideActionDto } from './dto/ride.dto';
import { PaginationDto } from '@dtos/pagination.dto';
import { ApiType } from '@common/decorators';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop')
export class RideController {
    constructor(private readonly rideService: RideService) { }


    @Post('ride-request')
    @ApiType('user')
    @ApiOperation({ summary: 'Create a new ride request' })
    async createRideRequest(@Body() dto: CreateRideDto, @Req() req: any) {
        return await this.rideService.createRideRequest(req.user.id, dto);
    }

    @Get('ride/:id')
    @ApiType(['user', 'provider'])
    @ApiOperation({ summary: 'Get ride details' })
    async getRide(@Param('id') rideId: string) {
        return await this.rideService.getRide(rideId);
    }

    @Get('ride-history')
    @ApiType(['user', 'provider'])
    @ApiOperation({ summary: 'Get user or provider ride history' })
    async getRideHistory(@Req() req: any, @Query() query: PaginationDto) {
        return await this.rideService.getRideHistory(req.user, query);
    }

    @Post('ride/request-status')
    @ApiType('provider')
    @ApiOperation({ summary: 'Driver accepts/reject a ride request' })
    async acceptRide(@Body() body: RideActionDto, @Req() req: any) {
        return await this.rideService.handleRideRequest(req.user.id, body);
    }

    @Patch('ride/action-status')
    @ApiType('provider')
    @ApiOperation({ summary: 'Update ride status (reached, etc.)' })
    async updateStatus(@Body() body: UpdateRideStatusDto, @Req() req: any) {
        return await this.rideService.handleRideAction(req.user, body);
    }

    @Post('ride/verify-pickup')
    @ApiType('provider')
    @ApiOperation({ summary: 'Verify pickup OTP from user' })
    async verifyPickupOtp(@Body() body: VerifyOtpDto) {
        return await this.rideService.verifyPickupOtp(body);
    }

    @Patch('ride/change-destination')
    @ApiType('user')
    @ApiOperation({ summary: 'Change destination during ride' })
    async changeDestination(@Body() body: ChangeDestinationDto, @Req() req: any) {
        return await this.rideService.changeDestination(req.user, body);
    }

    @Post('ride/dispute')
    @ApiType('user')
    @ApiOperation({ summary: 'Report a dispute for a ride' })
    async reportDispute(@Body() body: ReportDisputeDto, @Req() req: any) {
        return await this.rideService.reportDispute(req.user.id, body);
    }

    @Post('review')
    @ApiType('user')
    @ApiOperation({ summary: 'Submit a review for a ride' })
    async submitReview(@Body() dto: SubmitReviewDto, @Req() req: any) {
        return await this.rideService.submitReview(req.user.id, dto);
    }
}
