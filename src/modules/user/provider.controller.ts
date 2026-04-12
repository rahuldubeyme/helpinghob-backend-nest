import { Body, Controller, Get, Post, Put, Patch, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateAvailabilityDto, UpdateLocationDto, UpdateShopDto, UpdateVehicleDto } from './dto/provider.dto';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';
import { ApiType } from '@common/decorators/api-type.decorator';

@ApiType(['api'])
@ApiTags('Provider - Profile & Management')
@Controller('provider')
export class ProviderController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Provider/Driver Profile' })
    @ApiResponse({ status: 200, description: 'Profile fetched successfully' })
    async getProfile(@Req() req: any) {
        return this.userService.getProviderProfile(req.user.id);
    }

    @Patch('availability')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update Online/Offline Status' })
    @ApiResponse({ status: 200, description: 'Availability updated successfully' })
    async updateAvailability(@Req() req: any, @Body() availabilityDto: UpdateAvailabilityDto) {
        return this.userService.updateAvailability(req.user.id, (availabilityDto as any).status);
    }

    @Put('location')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update Real-time Location' })
    @ApiResponse({ status: 200, description: 'Location updated successfully' })
    async updateLocation(@Req() req: any, @Body() locationDto: UpdateLocationDto) {
        return this.userService.updateLocation(req.user.id, locationDto.location);
    }

    @Get('earnings')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Provider Earnings Summary' })
    @ApiResponse({ status: 200, description: 'Earnings fetched successfully' })
    async getEarnings(@Req() req: any) {
        return this.userService.getEarnings(req.user.id);
    }

    @Post('onboard')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit Driver Onboarding Documents' })
    @ApiResponse({ status: 200, description: 'Documents submitted successfully and pending approval' })
    async onboard(@Req() req: any, @Body() onboardDto: any) {
        return this.userService.submitOnboarding(req.user.id, onboardDto);
    }

    @Get('earnings/detail')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Detailed India-style Earnings' })
    @ApiResponse({ status: 200, description: 'Detailed earnings fetched successfully' })
    async getEarningsDetail(@Req() req: any) {
        return this.userService.getDetailedEarnings(req.user.id);
    }
}
