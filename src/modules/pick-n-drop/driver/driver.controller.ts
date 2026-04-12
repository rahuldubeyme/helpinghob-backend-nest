import { Controller, Get, Patch, Body, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { DriverService } from './driver.service';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    @Get('available-drivers')
    @ApiOperation({ summary: 'Find nearby online drivers for a vehicle type' })
    async getAvailableDrivers(@Query('vehicleId') vehicleId: string, @Query('lat') lat: number, @Query('lng') lng: number) {
        return await this.driverService.getAvailableDrivers(vehicleId, Number(lat), Number(lng));
    }

    @Patch('driver/availability')
    @ApiOperation({ summary: 'Update driver availability status' })
    async updateAvailability(@Body('availability') availability: string, @Req() req: any) {
        return await this.driverService.updateAvailability(req.user.id, availability);
    }

    @Patch('driver/location')
    @ApiOperation({ summary: 'Update driver current location' })
    async updateLocation(@Body('lat') lat: number, @Body('lng') lng: number, @Req() req: any) {
        return await this.driverService.updateLocation(req.user.id, lat, lng);
    }

    @Get('driver/earnings')
    @ApiOperation({ summary: 'Get driver earnings summary' })
    async getDriverEarnings(@Req() req: any) {
        return await this.driverService.getDriverEarnings(req.user.id);
    }

    @Get('driver/history')
    @ApiOperation({ summary: 'Get driver ride history' })
    async getDriverRideHistory(@Req() req: any) {
        return await this.driverService.getDriverRideHistory(req.user.id);
    }
}
