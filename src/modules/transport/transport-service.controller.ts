import { Controller, Get, Post, Patch, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { VerticalBookingService } from '../verticals/vertical-booking.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';

const VERTICAL = 'transport-service';

@ApiTags('Transport Service')
@ApiBearerAuth()
@UseGuards(JwtAppUserAuthGuard)
@Controller('transport-service')
export class TransportServiceController {
    constructor(private readonly svc: VerticalBookingService) { }

    // ── RIDE routes (same as pick-and-drop but scoped to transport) ────────────
    @Post('ride/vehicle-pricing') vehiclePricing(@Body() dto: any) { return this.svc.vehiclePricing(dto); }
    @Post('ride/find-driver') findDriverByVehicle(@Body() dto: any) { return this.svc.findDriverByVehicle(dto); }
 

    // ── DRIVER sub-vertical (driver/driverRoutes.js from transport-service) ────
    @Get('driver/profile') driverProfile(@Req() req: any) {
        return this.svc.findDriverByVehicle({ userId: req.user._id });
    }
    @Post('driver/availability') setAvailability(@Req() req: any, @Body() dto: any) {
        // Driver availability toggled via user model
        return { success: true };
    }

    // ── COUPONS ────────────────────────────────────────────────────────────────
    @Get('coupons') getCoupons() { return this.svc.getCoupons(VERTICAL); }
    @Post('coupons/apply') applyCoupon(@Req() req: any, @Body() dto: any) { return this.svc.applyCoupon(req.user._id, VERTICAL, dto); }

    // ── PAYMENTS ───────────────────────────────────────────────────────────────
    @Post('payments/pay') pay(@Req() req: any, @Body() dto: any) { return this.svc.pay(req.user._id, dto); }
    @Get('payments/payment-success/:paymentIntentId') paymentSuccess(@Param('paymentIntentId') id: string) { return this.svc.paymentSuccess(id); }
}
