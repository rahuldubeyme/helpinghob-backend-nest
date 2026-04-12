import { Controller, Get, Body, Param, Query, Patch } from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';
import { ApiType, Auth, CurrentUser } from '@common/decorators';
import { ROLE, USER_ROLE } from '@common/constant';
import { BookingsService } from './booking.service';
import { MerchantBookingListDto, MerchantVerifyOtpDto, UpdateBookingStatusDto } from './dto/booking.dto';

@ApiType(['admin', 'vendor', 'api'])
@Auth(ROLE.USER, ROLE.PROVIDER)
@ApiTags('Bookings & Redemptions')
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) { }

    @ApiType(['admin', 'vendor', 'api'])
    @Auth(ROLE.USER, ROLE.PROVIDER)
    @Get()
    @ApiOperation({ summary: 'List all service bookings for the merchant' })
    findAll(
        @CurrentUser() user: any,
        @Query() query: MerchantBookingListDto
    ) {
        return this.bookingsService.findAll(user, query);
    }

    @ApiType(['admin', 'vendor', 'api'])
    @Auth(ROLE.USER, ROLE.PROVIDER)
    @Get('/redemptions')
    @ApiOperation({ summary: 'Redemption Tracking: View list of redeemed services' })
    findRedemptions(
        @CurrentUser() user: any,
        @Query() query: MerchantBookingListDto
    ) {
        return this.bookingsService.findRedemptions(user.id, query);
    }

    @ApiType(['admin', 'vendor', 'api'])
    @Auth(ROLE.USER, ROLE.PROVIDER)
    @Get(':id')
    @ApiOperation({ summary: 'Get booking details' })
    findOne(@CurrentUser() user: any, @Param('id') id: string) {
        return this.bookingsService.findOne(user, id);
    }

    @ApiType(['vendor'])
    @Auth(ROLE.PROVIDER)
    @Patch(':id/verify-otp')
    @ApiOperation({ summary: 'Verify OTP and redeem service' })
    verifyOtp(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: MerchantVerifyOtpDto
    ) {
        return this.bookingsService.verifyOtp(user.id, id, dto);
    }

    @ApiType(['vendor'])
    @Auth(ROLE.PROVIDER)
    @Patch(':id/status')
    @ApiOperation({ summary: 'Update booking status (confirmed, completed, etc.)' })
    updateStatus(
        @CurrentUser() user: any,
        @Param('id') id: string,
        @Body() dto: UpdateBookingStatusDto
    ) {
        return this.bookingsService.updateStatus(user.id, id, dto);
    }
}
