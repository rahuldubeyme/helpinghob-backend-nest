import {
    Controller, Get, Post, Put, Delete, Body, Query, Req, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DairyDropService } from './dairy-drop.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';
import {
    CreateShopProfileDto, UpdateShopProfileDto, CreateOwnerProfileDto, UpdateOwnerProfileDto,
    GetCommonProductListQueryDto, SelectCommonProductsDto,
    AddProductDto, UpdateProductDto, DeleteProductQueryDto, GetProductListQueryDto, GetProductDetailsQueryDto,
    GetInventoryQueryDto, UpdateInventoryDto, GetOrdersQueryDto, UpdateOrderStatusDto,
    GetEarningsQueryDto, GetRatingsQueryDto,
} from './dto/dairy-drop.dto';

@ApiTags('Dairy Drop')
@ApiBearerAuth()
@UseGuards(JwtAppUserAuthGuard)
@Controller('dairy-drop')
export class DairyDropController {
    constructor(private readonly svc: DairyDropService) { }

    @Post('create-shop-profile')
    @ApiOperation({ summary: 'Create dairy shop profile' })
    createShopProfile(@Req() req: any, @Body() dto: CreateShopProfileDto) {
        return this.svc.createShopProfile(req.user._id, dto);
    }

    @Put('create-shop-profile')
    @ApiOperation({ summary: 'Update dairy shop profile' })
    updateShopProfile(@Req() req: any, @Body() dto: UpdateShopProfileDto) {
        return this.svc.updateShopProfile(req.user._id, dto);
    }

    @Get('create-shop-profile')
    @ApiOperation({ summary: 'Get dairy shop profile' })
    getShopProfile(@Req() req: any) {
        return this.svc.getShopProfile(req.user._id);
    }

    @Post('create-profile')
    @ApiOperation({ summary: 'Create dairy owner personal profile' })
    createOwnerProfile(@Req() req: any, @Body() dto: CreateOwnerProfileDto) {
        return this.svc.createOwnerProfile(req.user._id, dto);
    }

    @Put('create-profile')
    @ApiOperation({ summary: 'Update dairy owner personal profile' })
    updateOwnerProfile(@Req() req: any, @Body() dto: UpdateOwnerProfileDto) {
        return this.svc.updateOwnerProfile(req.user._id, dto);
    }

    @Get('common-product-list')
    @ApiOperation({ summary: 'Get global product catalogue for dairy' })
    getCommonProductList(@Query() q: GetCommonProductListQueryDto) {
        return this.svc.getCommonProductList(q);
    }

    @Post('common-product-list')
    @ApiOperation({ summary: 'Bulk-select products from catalogue into shop' })
    selectCommonProducts(@Req() req: any, @Body() dto: SelectCommonProductsDto) {
        return this.svc.selectCommonProducts(req.user._id, dto.productIds);
    }

    @Post('add-product')
    @ApiOperation({ summary: 'Add a custom product to dairy shop' })
    addProduct(@Req() req: any, @Body() dto: AddProductDto) {
        return this.svc.addProduct(req.user._id, dto);
    }

    @Put('update-product')
    @ApiOperation({ summary: 'Update an existing product' })
    updateProduct(@Req() req: any, @Body() dto: UpdateProductDto) {
        return this.svc.updateProduct(req.user._id, dto);
    }

    @Delete('update-product')
    @ApiOperation({ summary: 'Delete a product (soft delete via query ?productId)' })
    deleteProduct(@Query() q: DeleteProductQueryDto) {
        return this.svc.deleteProduct(q.productId);
    }

    @Get('product-list')
    @ApiOperation({ summary: 'List all products for the dairy shop' })
    getProductList(@Req() req: any, @Query() q: GetProductListQueryDto) {
        return this.svc.getProductList(req.user._id, q);
    }

    @Get('product-details')
    @ApiOperation({ summary: 'Get product details by productId' })
    getProductDetails(@Query() q: GetProductDetailsQueryDto) {
        return this.svc.getProductDetails(q.productId);
    }

    @Get('inventory')
    @ApiOperation({ summary: 'Get current inventory levels' })
    getInventory(@Req() req: any, @Query() q: GetInventoryQueryDto) {
        return this.svc.getInventory(req.user._id, q);
    }

    @Post('inventory')
    @ApiOperation({ summary: 'Update inventory quantities' })
    updateInventory(@Req() req: any, @Body() dto: UpdateInventoryDto) {
        return this.svc.updateInventory(req.user._id, dto.items);
    }

    @Get('orders')
    @ApiOperation({ summary: 'List orders received by the dairy shop' })
    getOrders(@Req() req: any, @Query() q: GetOrdersQueryDto) {
        return this.svc.getOrders(req.user._id, q);
    }

    @Post('orders/status')
    @ApiOperation({ summary: 'Update order status (accept/reject/dispatch)' })
    updateOrderStatus(@Req() req: any, @Body() dto: UpdateOrderStatusDto) {
        return this.svc.updateOrderStatus(req.user._id, dto);
    }

    @Get('earnings')
    @ApiOperation({ summary: 'Get earnings summary' })
    getEarnings(@Req() req: any, @Query() q: GetEarningsQueryDto) {
        return this.svc.getEarnings(req.user._id, q);
    }

    @Get('ratings')
    @ApiOperation({ summary: 'Get ratings and reviews for the shop' })
    getRatings(@Req() req: any, @Query() q: GetRatingsQueryDto) {
        return this.svc.getRatings(req.user._id, q);
    }
}
