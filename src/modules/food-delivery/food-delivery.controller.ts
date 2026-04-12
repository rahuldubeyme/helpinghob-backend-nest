import {
    Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerticalBookingService } from '../verticals/vertical-booking.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';

const VERTICAL = 'food-delivery';

@ApiTags('Food Delivery')
@ApiBearerAuth()
@Controller('food-delivery')
export class FoodDeliveryController {
    constructor(private readonly svc: VerticalBookingService) { }

    // ── HOME ───────────────────────────────────────────────────────────────────
    @Get('home/category-list') @ApiOperation({ summary: 'Category list' })
    getCategoryList() { return this.svc.getCategoryList(VERTICAL); }

    @Post('home/subcategory-list') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Subcategory list' })
    getSubCategoryList(@Body() body: any) { return this.svc.getSubCategoryList(VERTICAL, body.categoryIds, body.search); }

    @Get('home/banner-list') @ApiOperation({ summary: 'Banner list' })
    getBannerList() { return this.svc.getBannerList(VERTICAL); }

    @Post('home') @ApiOperation({ summary: 'Home feed of nearby restaurants/providers' })
    homeList(@Body() dto: any) { return this.svc.homeList(VERTICAL, dto); }

    // ── BOOKINGS ───────────────────────────────────────────────────────────────
    @Post('bookings') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Booking list' })
    bookingList(@Req() req: any, @Body() dto: any) { return this.svc.bookingList(req.user._id, VERTICAL, dto); }

    @Post('bookings/bookingDetails') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Booking details' })
    bookingDetails(@Req() req: any, @Body() dto: any) { return this.svc.bookingDetails(req.user._id, dto.bookingId); }

    @Post('bookings/createBooking') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Create booking' })
    createBooking(@Req() req: any, @Body() dto: any) { return this.svc.createBooking(req.user._id, VERTICAL, dto); }

    @Post('bookings/cancelBooking') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Cancel booking' })
    cancelBooking(@Req() req: any, @Body() dto: any) { return this.svc.cancelBooking(req.user._id, dto.bookingId, dto.reason); }

    @Post('bookings/pay') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Pay for booking' })
    pay(@Req() req: any, @Body() dto: any) { return this.svc.pay(req.user._id, dto); }

    @Get('bookings/payment-success/:paymentIntentId') @ApiOperation({ summary: 'Stripe payment success webhook' })
    paymentSuccess(@Param('paymentIntentId') paymentIntentId: string) { return this.svc.paymentSuccess(paymentIntentId); }

    @Post('bookings/receiveBooking') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Provider receives booking' })
    receiveBooking(@Req() req: any, @Body() dto: any) { return this.svc.receiveBooking(req.user._id, dto); }

    @Post('bookings/bookingAction') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Accept/reject booking' })
    bookingAction(@Req() req: any, @Body() dto: any) { return this.svc.bookingAction(req.user._id, dto); }

    @Post('bookings/bookingStatus') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Update booking status' })
    bookingStatus(@Req() req: any, @Body() dto: any) { return this.svc.bookingStatus(req.user._id, dto); }

    @Post('bookings/rating') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Rate a booking' })
    rating(@Req() req: any, @Body() dto: any) { return this.svc.rateBooking(req.user._id, dto); }

    @Post('bookings/addAdditionalServices') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Add extra services to booking' })
    addAdditionalServices(@Req() req: any, @Body() dto: any) { return this.svc.addAdditionalServices(req.user._id, dto); }

    @Post('bookings/getAdditionalServices') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Get additional services' })
    getAdditionalServices(@Body() dto: any) { return this.svc.getAdditionalServices(dto.bookingId); }

    @Post('bookings/deleteService') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Delete additional service' })
    deleteService(@Body() dto: any) { return this.svc.deleteService(dto); }

    // ── COUPONS ────────────────────────────────────────────────────────────────
    @Get('coupons') @ApiOperation({ summary: 'List available coupons' })
    getCoupons() { return this.svc.getCoupons(VERTICAL); }

    @Post('coupons/apply') @UseGuards(JwtAppUserAuthGuard) @ApiOperation({ summary: 'Apply a coupon code' })
    applyCoupon(@Req() req: any, @Body() dto: any) { return this.svc.applyCoupon(req.user._id, VERTICAL, dto); }
}
