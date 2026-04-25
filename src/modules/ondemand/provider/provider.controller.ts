import { Controller, Get, Patch, Body, Req, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { ProviderService } from './provider.service';
import { UpdateAvailabilityDto, UpdateProviderLocationDto } from './dto/provider.dto';
import { ApiType } from '@common/decorators';

@ApiTags('Ondemand-Provider')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('ondemand/provider')
export class ProviderController {
    constructor(
        private readonly providerService: ProviderService
    ) { }

    @Get('home')
    @ApiType('provider')
    @ApiOperation({ summary: 'home screen for provider' })
    async getHomeScreen(@Req() req: any) {
        return await this.providerService.getHomeScreen(req.user);
    }

    @Get('info')
    @ApiType('user')
    @ApiOperation({ summary: 'Get provider info' })
    async getProviderInfo(@Query('providerId') providerId: string) {
        return await this.providerService.getProviderInfo(providerId);
    }

    @Patch('update-availability')
    @ApiType('provider')
    @ApiOperation({ summary: 'Update provider availability status Online/Offline' })
    async updateAvailability(@Body() body: UpdateAvailabilityDto, @Req() req: any) {
        return await this.providerService.updateAvailability(req.user.id, body.availability);
    }

    @Patch('update-location')
    @ApiType('provider')
    @ApiOperation({ summary: 'Update provider current location' })
    async updateLocation(@Body() body: UpdateProviderLocationDto, @Req() req: any) {
        return await this.providerService.updateLocation(req.user.id, body.lat, body.lng);
    }

    @Get('earnings')
    @ApiType('provider')
    @ApiOperation({ summary: 'Get provider earnings summary' })
    async getProviderEarnings(@Req() req: any) {
        return await this.providerService.getProviderEarnings(req.user.id);
    }
}
