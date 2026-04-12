import {
    Controller, Get, Post, Put, Delete, Body, Query, Req, Param, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';
import {
    UpdateUserProfileDto, AddNewAddressDto, EditAddressDto,
    HomeListDto, UpdateLocationDto, AddFavoriteDto, UpdateUserServicesDto,
} from '@shared/dto/user-profile.dto';
import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

class SubcategoryListDto {
    @ApiPropertyOptional({ type: [String] }) categoryIds?: string[];
    @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
}
class AddServicePriceDto {
    @ApiPropertyOptional() serviceId?: string;
    @ApiPropertyOptional() price?: number;
}
class DeleteAddressQueryDto {
    @ApiPropertyOptional() requestId?: string;
}
class MarkDefaultAddressQueryDto {
    @ApiPropertyOptional() addressId?: string;
}
class GetServicesPriceQueryDto {
    @ApiPropertyOptional() serviceId?: string;
}
class ManageServicesPriceDto {
    @ApiPropertyOptional() services?: any[];
}

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAppUserAuthGuard)
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get('profile')
    @ApiOperation({ summary: 'Get user profile' })
    getProfile(@Req() req: any) {
        return this.userService.getProfile(req.user._id);
    }

    @Get('driver-profile')
    @ApiOperation({ summary: 'Get driver-specific profile info (vehicle, availability)' })
    getDriverProfile(@Req() req: any) {
        return this.userService.getProviderProfile(req.user._id);
    }

    @Post('update-profile')
    @ApiOperation({ summary: 'Update user profile' })
    updateProfile(@Req() req: any, @Body() dto: UpdateUserProfileDto) {
        return this.userService.updateProfile(req.user._id, dto);
    }

    @Get('delete-account')
    @ApiOperation({ summary: 'Soft-delete current user account' })
    deleteAccount(@Req() req: any) {
        return this.userService.deleteAccount(req.user._id);
    }

    @Get('category-list')
    @ApiOperation({ summary: 'Get all service categories (public)' })
    getCategoryList() {
        return this.userService.getCategoryList();
    }

    @Post('subcategory-list')
    @ApiOperation({ summary: 'Get subcategories filtered by categoryIds' })
    getSubCategoryList(@Body() dto: SubcategoryListDto) {
        return this.userService.getSubCategoryList(dto.categoryIds ?? [], dto.search);
    }

    @Get('banner-list')
    @ApiOperation({ summary: 'Get active banners (public)' })
    getBannerList() {
        return this.userService.getBannerList();
    }

    @Put('update-user-services')
    @ApiOperation({ summary: 'Update service provider services list & info' })
    updateUserServices(@Req() req: any, @Body() dto: UpdateUserServicesDto) {
        return this.userService.updateUserServices(req.user._id, dto);
    }

    @Post('add-service-price')
    @ApiOperation({ summary: 'Add subcategory service price for provider' })
    addServicePrice(@Req() req: any, @Body() dto: AddServicePriceDto) {
        return this.userService.addServicePrice(req.user._id, dto);
    }

    @Get('get-address')
    @ApiOperation({ summary: 'Get all saved addresses' })
    getAddress(@Req() req: any) {
        return this.userService.getAddresses(req.user._id);
    }

    @Post('add-new-address')
    @ApiOperation({ summary: 'Add a new address' })
    addNewAddress(@Req() req: any, @Body() dto: AddNewAddressDto) {
        return this.userService.addAddress(req.user._id, dto);
    }

    @Post('edit-address')
    @ApiOperation({ summary: 'Edit an existing address' })
    editAddress(@Req() req: any, @Body() dto: EditAddressDto) {
        return this.userService.updateAddress(req.user._id, dto);
    }

    @Get('delete-address')
    @ApiOperation({ summary: 'Delete an address by requestId (query)' })
    deleteAddress(@Req() req: any, @Query() q: DeleteAddressQueryDto) {
        return this.userService.deleteAddress(req.user._id, q.requestId!);
    }

    @Get('notifications')
    @ApiOperation({ summary: 'Get notification list for user' })
    notificationList(@Req() req: any) {
        return this.userService.notificationList(req.user._id);
    }

    @Post('support')
    @ApiOperation({ summary: 'Submit a support / contact-us request' })
    submitSupport(@Req() req: any, @Body() body: any) {
        return this.userService.submitSupport(req.user._id, body);
    }

    @Get('availability')
    @ApiOperation({ summary: 'Get service provider availability/slots' })
    getAvailability(@Req() req: any) {
        return this.userService.getProfile(req.user._id);   // delegated â€“ availability lives on user doc
    }

    @Post('home')
    @ApiOperation({ summary: 'Get home feed of nearby service providers' })
    homeList(@Body() dto: HomeListDto) {
        return this.userService.homeList(dto);
    }

    @Get('markDefaultAddress')
    @ApiOperation({ summary: 'Set an address as default' })
    markDefaultAddress(@Req() req: any, @Query() q: MarkDefaultAddressQueryDto) {
        return this.userService.setPrimaryAddress(req.user._id, q.addressId!);
    }

    @Get('earnings')
    @ApiOperation({ summary: 'Get earnings summary for service provider' })
    earningsList(@Req() req: any) {
        return this.userService.getEarnings(req.user._id);
    }

    @Put('manageServicesPrice')
    @ApiOperation({ summary: 'Bulk-manage service prices for provider' })
    manageServicesPrice(@Req() req: any, @Body() dto: ManageServicesPriceDto) {
        return this.userService.addServicePrice(req.user._id, dto);
    }

    @Put('updateLocation')
    @ApiOperation({ summary: 'Update user/driver live location' })
    updateLocation(@Req() req: any, @Body() dto: UpdateLocationDto) {
        return this.userService.updateLocation(req.user._id, dto.location);
    }

    @Put('updateLanguage')
    @ApiOperation({ summary: 'Update preferred language' })
    updateLanguage(@Req() req: any, @Body() body: { language: string }) {
        return this.userService.updateLanguage(req.user._id, body.language);
    }

    @Get('getServicesPrice')
    @ApiOperation({ summary: 'Get service price list for a provider' })
    getServicesPrice(@Req() req: any, @Query() q: GetServicesPriceQueryDto) {
        return this.userService.getProfile(req.user._id);   // simplified â€“ prices on user doc
    }

    @Post('addFavorite')
    @ApiOperation({ summary: 'Toggle favourite service provider' })
    addFavorite(@Req() req: any, @Body() dto: AddFavoriteDto) {
        return this.userService.addFavorite(req.user._id, dto.userId);
    }
}
