import { Body, Controller, Get, Post, Put, Delete, Patch, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';
import { ApiType } from '@common/decorators/api-type.decorator';

@ApiType(['api'])
@ApiTags('Customer - Address')
@Controller('user/address')
export class UserAddressController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get All Saved Addresses' })
    @ApiResponse({ status: 200, description: 'Addresses fetched successfully' })
    async getAddresses(@Req() req: any) {
        return this.userService.getAddresses(req.user.id);
    }

    @Post()
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add New Address' })
    @ApiResponse({ status: 201, description: 'Address added successfully' })
    async addAddress(@Req() req: any, @Body() addressDto: CreateAddressDto) {
        return this.userService.addAddress(req.user.id, addressDto);
    }

    @Put(':id')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update Existing Address' })
    @ApiResponse({ status: 200, description: 'Address updated successfully' })
    async updateAddress(@Req() req: any, @Param('id') addressId: string, @Body() addressDto: UpdateAddressDto) {
        return this.userService.updateAddress(req.user.id, { ...addressDto, addressId });
    }

    @Delete(':id')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete Address (Soft Delete)' })
    @ApiResponse({ status: 200, description: 'Address deleted successfully' })
    async deleteAddress(@Req() req: any, @Param('id') addressId: string) {
        return this.userService.deleteAddress(req.user.id, addressId);
    }

    @Patch('default/:id')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Set Address as Primary' })
    @ApiResponse({ status: 200, description: 'Address marked as primary successfully' })
    async setPrimaryAddress(@Req() req: any, @Param('id') addressId: string) {
        return this.userService.setPrimaryAddress(req.user.id, addressId);
    }
}
