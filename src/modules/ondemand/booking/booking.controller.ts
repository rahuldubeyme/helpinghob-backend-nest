import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OndemandBookingService } from './booking.service';
import { Auth, CurrentUser } from '@common/decorators';
import { ROLE } from '@common/constant';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@ApiTags('On-Demand Booking')
@Controller('ondemand-booking')
export class OndemandBookingController {
    constructor(private readonly bookingService: OndemandBookingService) { }

    @Post('create-booking')
    @Auth(ROLE.USER)
    @ApiOperation({ summary: 'User: Book a service provider' })
    createBooking(@CurrentUser('id') userId: string, @Body() dto: any) {
        return this.bookingService.createBooking(userId, dto);
    }

    @Get('provider/my-bookings')
    @Auth(ROLE.PROVIDER)
    @ApiOperation({ summary: 'Provider: Get my bookings' })
    @ApiQuery({ name: 'status', required: false, enum: ['pending', 'accepted', 'on_the_way', 'reached', 'started', 'completed', 'cancelled'] })
    getMyBookings(@CurrentUser('id') providerId: string, @Query('status') status: string) {
        return this.bookingService.getMyBookings(providerId, status);
    }

    @Patch('provider/booking/:id/action')
    @Auth(ROLE.PROVIDER)
    @ApiOperation({ summary: 'Provider: Accept or Reject booking' })
    updateBookingStatus(
        @CurrentUser('id') providerId: string,
        @Param('id') bookingId: string,
        @Body() dto: UpdateBookingStatusDto,
    ) {
        return this.bookingService.updateBookingStatus(providerId, bookingId, dto.status);
    }

    @Patch('provider/booking/:id/status')
    @Auth(ROLE.PROVIDER)
    @ApiOperation({ summary: 'Provider: Update booking status (on_the_way → reached → completed | cancelled)' })
    updateStatus(
        @CurrentUser('id') providerId: string,
        @Param('id') bookingId: string,
        @Body() dto: UpdateBookingStatusDto,
    ) {
        return this.bookingService.updateBookingStatus(providerId, bookingId, dto.status);
    }

    @Patch('provider/booking/:id/reschedule')
    @Auth(ROLE.PROVIDER)
    @ApiOperation({ summary: 'Provider: Reschedule booking' })
    rescheduleBooking(
        @CurrentUser('id') providerId: string,
        @Param('id') bookingId: string,
        @Body('newTime') newTime: Date
    ) {
        return this.bookingService.rescheduleBooking(providerId, bookingId, newTime);
    }

    @Post('provider/booking/:id/start')
    @Auth(ROLE.PROVIDER)
    @ApiOperation({ summary: 'Provider: Start service with OTP and Before images' })
    startService(
        @CurrentUser('id') providerId: string,
        @Param('id') bookingId: string,
        @Body('otp') otp: string,
        @Body('images') images: string[]
    ) {
        return this.bookingService.startService(providerId, bookingId, otp, images);
    }

    @Post('provider/booking/:id/complete')
    @Auth(ROLE.PROVIDER)
    @ApiOperation({ summary: 'Provider: Complete service with After images and payment' })
    completeService(
        @CurrentUser('id') providerId: string,
        @Param('id') bookingId: string,
        @Body('images') images: string[],
        @Body('paymentMethod') paymentMethod: 'cash' | 'upi'
    ) {
        return this.bookingService.completeService(providerId, bookingId, images, paymentMethod);
    }

    @Get('provider/earnings')
    @Auth(ROLE.PROVIDER)
    @ApiOperation({ summary: 'Provider: My earnings history' })
    getEarnings(@CurrentUser('id') providerId: string) {
        return this.bookingService.getEarnings(providerId);
    }
}
