/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Patch, Post, Req, Headers, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import {
    RequestLoginOtpDto, VerifyOtpDto, ResendOtpDto,
    CreateProfileDto, SetupProfileDto, UpdateProfileDto,
    SetupEmailDto, SetupPhoneDto
} from "./dto/app-user-auth.dto";
import { ApiType } from "@common/decorators/api-type.decorator";
import { Auth } from "@common/decorators";

@ApiType(['user', 'web', 'provider']) // swagger
@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    // ── Step 1: Request OTP ───────────────────────────────────────────────────
    @Post('request-login-otp')
    @ApiOperation({ summary: 'Request login OTP (sends OTP to mobile)' })
    @ApiResponse({ status: 201, description: 'OTP sent, returns temp JWT token' })
    requestLoginOtp(
        @Body() dto: RequestLoginOtpDto
    ) {
        return this.authService.requestLoginOtp(dto);
    }

    // ── Step 2: Verify OTP ────────────────────────────────────────────────────
    @Post('verify-otp')
    @ApiOperation({ summary: 'Verify OTP and get final JWT token' })
    @ApiResponse({ status: 200, description: 'OTP verified, returns final JWT token and user profile' })
    verifyOtp(
        @Body() dto: VerifyOtpDto
    ) {
        return this.authService.verifyOtp(dto);
    }

    // ── Step 2b: Resend OTP ───────────────────────────────────────────────────
    @Post('resend-otp')
    @ApiOperation({ summary: 'Resend OTP to the same mobile' })
    resendOtp(
        @Body() dto: ResendOtpDto,
    ) {
        return this.authService.resendOtp(dto);
    }

    // ── Step 3: Create Profile (basic info) ───────────────────────────────────
    @Post('create-profile')
    @Auth()
    @ApiOperation({ summary: 'Save name, email, gender, DOB after OTP verification' })
    createProfile(
        @Req() req: any,
        @Body() dto: CreateProfileDto,
        @Headers() headers: Record<string, string>,
    ) {
        return this.authService.createProfile(req.user.id, dto, headers);
    }

    // ── Step 4: Setup Profile (role-specific: driver/merchant) ────────────────
    @Post('setup-profile')
    @Auth()
    @ApiOperation({ summary: 'Setup driver/merchant specific data (vehicle, docs, location)' })
    setupProfile(
        @Req() req: any,
        @Body() dto: SetupProfileDto,
        @Headers() headers: Record<string, string>,
    ) {
        return this.authService.setupProfile(req.user.id, dto, headers);
    }

    // ── Update Profile (general update) ──────────────────────────────────────
    @Patch('update-profile')
    @Auth()
    @ApiOperation({ summary: 'Update any profile field (name, avatar, vehicle info, location)' })
    updateProfile(
        @Req() req: any,
        @Body() dto: UpdateProfileDto,
        @Headers() headers: Record<string, string>,
    ) {
        return this.authService.updateProfile(req.user.id, dto, headers);
    }

    // ── Setup Email (OTP-verified email addition) ─────────────────────────────
   /*  @Post('setup-email')
    @Auth()
    @ApiOperation({ summary: 'Add or change email — triggers verification OTP' })
    setupEmail(
        @Req() req: any,
        @Body() dto: SetupEmailDto,
        @Headers() headers: Record<string, string>,
    ) {
        return this.authService.setupEmail(req.user.id, dto, headers);
    } */

    // ── Setup Phone (OTP-verified phone change) ───────────────────────────────
   /*  @Post('setup-phone')
    @Auth()
    @ApiOperation({ summary: 'Change mobile number — triggers OTP verification' })
    setupPhone(
        @Req() req: any,
        @Body() dto: SetupPhoneDto,
        @Headers() headers: Record<string, string>,
    ) {
        return this.authService.setupPhone(req.user.id, dto, headers);
    } */

}
