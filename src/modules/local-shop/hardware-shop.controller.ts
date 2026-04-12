import {
    Controller, Get, Post, Put, Delete, Body, Query, Req, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { HardwareShopService } from './hardware-shop.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';
import {
    ShopDetailsQueryDto, ShopCatalogQueryDto, ProductListQueryDto, ProductDetailsQueryDto,
    AddToCartDto, UpdateCartDto, CreateOrderDto, PayDto, OrdersQueryDto,
    OrderDetailsQueryDto, RaiseDisputeDto, RatingReviewDto, GetReviewsQueryDto
} from '@shared/dto/marketplace.dto';

@ApiTags('Hardware Shop')
@ApiBearerAuth()
@UseGuards(JwtAppUserAuthGuard)
@Controller('hardware-shop')
export class HardwareShopController {
    constructor(private readonly service: HardwareShopService) { }

    @Get('home') home(@Req() req: any) { return this.service.home(req.user._id); }
    @Get('shop-details') shopDetails(@Query() q: ShopDetailsQueryDto) { return this.service.shopDetails(q.shopId); }
    @Get('shop-catalog') shopCatalog(@Query() q: ShopCatalogQueryDto) { return this.service.shopCatalog(q.shopId, q.search); }
    @Get('product-list') productList(@Query() q: ProductListQueryDto) { return this.service.productList(q.shopId, q.categoryId, q.search); }
    @Get('product-details') productDetails(@Query() q: ProductDetailsQueryDto) { return this.service.productDetails(q.productId); }
    @Post('add-to-cart') addToCart(@Req() req: any, @Body() dto: AddToCartDto) { return this.service.addToCart(req.user._id, dto.productId, dto.shopId, dto.quantity); }
    @Put('add-to-cart') updateCart(@Req() req: any, @Body() dto: UpdateCartDto) { return this.service.updateCart(req.user._id, dto.productId, dto.shopId, dto.quantity); }
    @Get('cart-details') cartDetails(@Req() req: any) { return this.service.cartDetails(req.user._id); }
    @Delete('cart-details') clearCart(@Req() req: any) { return this.service.clearCart(req.user._id); }
    @Post('create-order') createOrder(@Req() req: any, @Body() dto: CreateOrderDto) { return this.service.createOrder(req.user._id, dto); }
    @Post('pay') pay(@Req() req: any, @Body() dto: PayDto) { return this.service.pay(req.user._id, dto); }
    @Get('orders') orders(@Req() req: any, @Query() q: OrdersQueryDto) { return this.service.orders(req.user._id, q); }
    @Get('order-details') orderDetails(@Req() req: any, @Query() q: OrderDetailsQueryDto) { return this.service.orderDetails(req.user._id, q.orderId); }
    @Post('raise-dispute') raiseDispute(@Req() req: any, @Body() dto: RaiseDisputeDto) { return this.service.raiseDispute(req.user._id, dto); }
    @Post('rating-review') ratingReview(@Req() req: any, @Body() dto: RatingReviewDto) { return this.service.ratingReview(req.user._id, dto); }
    @Get('rating-review') getReviews(@Query() q: GetReviewsQueryDto) { return this.service.getReviews(q.shopId); }
}
