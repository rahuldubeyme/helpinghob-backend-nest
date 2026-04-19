import { Controller, Get, Patch, Body, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { DriverService } from './driver.service';
import { UpdateAvailabilityDto, UpdateDriverLocationDto } from './dto/driver.dto';
import { PaginationDto } from '@dtos/pagination.dto';
import { ApiType } from '@common/decorators';
import { RideService } from '../ride/ride.service';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop')
export class DriverController {
    constructor(
        private readonly driverService: DriverService,
        private readonly rideService: RideService
    ) { }

    @Get('home')
    @ApiType('provider')
    @ApiOperation({ summary: 'home screen for driver' })
    async getHomeScreen(@Req() req: any) {
        return await this.rideService.getHomeScreen(req.user);
    }

    @Get('info')
    @ApiType('user')
    @ApiOperation({ summary: 'Get driver info' })
    async getDriverInfo(@Query('driverId') driverId: string) {
        return await this.driverService.getDriverInfo(driverId);
    }

    @Patch('update-availability')
    @ApiType('provider')
    @ApiOperation({ summary: 'Update driver availability status Online/Offline' })
    async updateAvailability(@Body() body: UpdateAvailabilityDto, @Req() req: any) {
        return await this.driverService.updateAvailability(req.user.id, body.availability);
    }

    @Patch('update-location')
    @ApiType('provider')
    @ApiOperation({ summary: 'Update driver current location' })
    async updateLocation(@Body() body: UpdateDriverLocationDto, @Req() req: any) {
        return await this.driverService.updateLocation(req.user.id, body.lat, body.lng);
    }

    @Get('earnings')
    @ApiType('provider')
    @ApiOperation({ summary: 'Get driver earnings summary' })
    async getDriverEarnings(@Req() req: any) {
        return await this.driverService.getDriverEarnings(req.user.id);
    }
}
