import { Controller, Get, Patch, Body, Req, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { DriverService } from './driver.service';
import { UpdateAvailabilityDto, UpdateDriverLocationDto } from './dto/driver.dto';
import { PaginationDto } from '@dtos/pagination.dto';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    @Get('driver/info')
    @ApiOperation({ summary: 'Get driver info' })
    async getDriverInfo(@Query('driverId') driverId: string) {
        return await this.driverService.getDriverInfo(driverId);
    }

    @Patch('driver/update-availability')
    @ApiOperation({ summary: 'Update driver availability status Online/Offline' })
    async updateAvailability(@Body() body: UpdateAvailabilityDto, @Req() req: any) {
        return await this.driverService.updateAvailability(req.user.id, body.availability);
    }

    @Patch('driver/update-location')
    @ApiOperation({ summary: 'Update driver current location' })
    async updateLocation(@Body() body: UpdateDriverLocationDto, @Req() req: any) {
        return await this.driverService.updateLocation(req.user.id, body.lat, body.lng);
    }

    @Get('driver/earnings')
    @ApiOperation({ summary: 'Get driver earnings summary' })
    async getDriverEarnings(@Req() req: any) {
        return await this.driverService.getDriverEarnings(req.user.id);
    }

    @Get('driver/history')
    @ApiOperation({ summary: 'Get driver ride history' })
    async getDriverRideHistory(@Req() req: any, @Query() query: PaginationDto) {
        return await this.driverService.getDriverRideHistory(req.user.id, query);
    }
}
