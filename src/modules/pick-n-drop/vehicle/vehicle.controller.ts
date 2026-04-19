import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ROLE } from '@common/constant';
import { Auth } from '@common/decorators';
import { VehicleService } from './vehicle.service';
import { RidePricingDto } from './dto/vehicle.dto';
import { ApiType } from '@common/decorators';

@ApiTags('Pick-n-Drop')
@Auth(ROLE.USER, ROLE.PROVIDER)
@Controller('pick-n-drop/vehicle')
export class VehicleController {
    constructor(private readonly vehicleService: VehicleService) { }

    @Get('vehicle-list')
    @ApiType(['user', 'provider'])
    @ApiOperation({ summary: 'Get list of all supported vehicles' })
    async getVehicles() {
        return await this.vehicleService.getVehicles();
    }

    @Post('find-driver')
    @ApiType('user')
    @ApiOperation({ summary: 'Get estimated pricing for all vehicle types' })
    async getVehiclePricing(@Body() body: RidePricingDto) {
        return await this.vehicleService.getVehiclePricing(body);
    }
}
