import { Controller, Get, Post, Patch, Body, Param, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { RideService } from './ride.service';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop')
export class RideController {
    constructor(private readonly rideService: RideService) { }

    @Post('ride-request')
    @ApiOperation({ summary: 'Create a new ride request' })
    async createRideRequest(@Body() dto: any, @Req() req: any) {
        return await this.rideService.createRideRequest(req.user.id, dto);
    }

    @Get('ride/:id')
    @ApiOperation({ summary: 'Get ride details' })
    async getRide(@Param('id') rideId: string) {
        return await this.rideService.getRide(rideId);
    }

    @Get('ride-history')
    @ApiOperation({ summary: 'Get user ride history' })
    async getRideHistory(@Req() req: any) {
        return await this.rideService.getRideHistory(req.user.id);
    }

    @Patch('ride/:id/accept')
    @ApiOperation({ summary: 'Driver accepts a ride request' })
    async acceptRide(@Param('id') rideId: string, @Req() req: any) {
        return await this.rideService.acceptRide(rideId, req.user.id);
    }

    @Patch('ride/:id/status')
    @ApiOperation({ summary: 'Update ride status (reached_pickup, etc.)' })
    async updateStatus(@Param('id') rideId: string, @Body('status') status: string) {
        return await this.rideService.updateStatus(rideId, status);
    }

    @Post('ride/:id/verify-pickup')
    @ApiOperation({ summary: 'Verify pickup OTP' })
    async verifyPickupOtp(@Param('id') rideId: string, @Body('otp') otp: string) {
        return await this.rideService.verifyPickupOtp(rideId, otp);
    }

    @Post('ride/:id/verify-dropoff')
    @ApiOperation({ summary: 'Verify drop-off OTP' })
    async verifyDropOffOtp(@Param('id') rideId: string, @Body('otp') otp: string) {
        return await this.rideService.verifyDropOffOtp(rideId, otp);
    }

    @Patch('ride/:id/destination')
    @ApiOperation({ summary: 'Change destination during ride' })
    async changeDestination(@Param('id') rideId: string, @Body('destination') destination: any, @Req() req: any) {
        return await this.rideService.changeDestination(rideId, req.user.id, destination);
    }

    @Post('ride/:id/cancel')
    @ApiOperation({ summary: 'Cancel a ride request' })
    async cancelRide(@Param('id') rideId: string, @Body('reason') reason: string, @Req() req: any) {
        return await this.rideService.cancelRide(rideId, req.user.id, reason);
    }

    @Post('ride/:id/dispute')
    @ApiOperation({ summary: 'Report a dispute for a ride' })
    async reportDispute(@Param('id') rideId: string, @Body() body: any, @Req() req: any) {
        return await this.rideService.reportDispute(rideId, req.user.id, body.reason, body.description);
    }

    @Post('review')
    @ApiOperation({ summary: 'Submit a review for a ride' })
    async submitReview(@Body() dto: any, @Req() req: any) {
        return await this.rideService.submitReview(req.user.id, dto);
    }
}
