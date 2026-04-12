import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerticalBookingService } from '../verticals/vertical-booking.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';

const VERTICAL = 'local-deals';

@ApiTags('Local Deals')
@ApiBearerAuth()
@Controller('local-deals')
export class LocalDealsController {
    constructor(private readonly svc: VerticalBookingService) { }
    @Get('home/category-list') getCategoryList() { return this.svc.getCategoryList(VERTICAL); }
    @Post('home/subcategory-list') getSubCategoryList(@Body() b: any) { return this.svc.getSubCategoryList(VERTICAL, b.categoryIds, b.search); }
    @Get('home/banner-list') getBannerList() { return this.svc.getBannerList(VERTICAL); }
    @Post('home') homeList(@Body() dto: any) { return this.svc.homeList(VERTICAL, dto); }
    @Post('bookings') @UseGuards(JwtAppUserAuthGuard) bookingList(@Req() req: any, @Body() dto: any) { return this.svc.bookingList(req.user._id, VERTICAL, dto); }
    @Post('bookings/bookingDetails') @UseGuards(JwtAppUserAuthGuard) bookingDetails(@Req() req: any, @Body() dto: any) { return this.svc.bookingDetails(req.user._id, dto.bookingId); }
    @Post('bookings/createBooking') @UseGuards(JwtAppUserAuthGuard) createBooking(@Req() req: any, @Body() dto: any) { return this.svc.createBooking(req.user._id, VERTICAL, dto); }
    @Post('bookings/cancelBooking') @UseGuards(JwtAppUserAuthGuard) cancelBooking(@Req() req: any, @Body() dto: any) { return this.svc.cancelBooking(req.user._id, dto.bookingId, dto.reason); }
    @Post('bookings/pay') @UseGuards(JwtAppUserAuthGuard) pay(@Req() req: any, @Body() dto: any) { return this.svc.pay(req.user._id, dto); }
    @Get('bookings/payment-success/:paymentIntentId') paymentSuccess(@Param('paymentIntentId') id: string) { return this.svc.paymentSuccess(id); }
    @Post('bookings/receiveBooking') @UseGuards(JwtAppUserAuthGuard) receiveBooking(@Req() req: any, @Body() dto: any) { return this.svc.receiveBooking(req.user._id, dto); }
    @Post('bookings/bookingAction') @UseGuards(JwtAppUserAuthGuard) bookingAction(@Req() req: any, @Body() dto: any) { return this.svc.bookingAction(req.user._id, dto); }
    @Post('bookings/bookingStatus') @UseGuards(JwtAppUserAuthGuard) bookingStatus(@Req() req: any, @Body() dto: any) { return this.svc.bookingStatus(req.user._id, dto); }
    @Post('bookings/rating') @UseGuards(JwtAppUserAuthGuard) rating(@Req() req: any, @Body() dto: any) { return this.svc.rateBooking(req.user._id, dto); }
    @Post('bookings/addAdditionalServices') @UseGuards(JwtAppUserAuthGuard) addAdditionalServices(@Req() req: any, @Body() dto: any) { return this.svc.addAdditionalServices(req.user._id, dto); }
    @Post('bookings/getAdditionalServices') @UseGuards(JwtAppUserAuthGuard) getAdditionalServices(@Body() dto: any) { return this.svc.getAdditionalServices(dto.bookingId); }
    @Post('bookings/deleteService') @UseGuards(JwtAppUserAuthGuard) deleteService(@Body() dto: any) { return this.svc.deleteService(dto); }
    @Get('coupons') getCoupons() { return this.svc.getCoupons(VERTICAL); }
    @Post('coupons/apply') @UseGuards(JwtAppUserAuthGuard) applyCoupon(@Req() req: any, @Body() dto: any) { return this.svc.applyCoupon(req.user._id, VERTICAL, dto); }
}
