import {
    Controller, Get, Post, Put, Delete, Body, Query, Req, Param, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GroceryService } from './grocery.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';
import {
    ShopDetailsQueryDto, ShopCatalogQueryDto, ProductListQueryDto, ProductDetailsQueryDto,
    AddToCartDto, UpdateCartDto, CreateOrderDto, PayDto, OrdersQueryDto,
    OrderDetailsQueryDto, RaiseDisputeDto, RatingReviewDto, GetReviewsQueryDto
} from '@shared/dto/marketplace.dto';

@ApiTags('Grocery')
@ApiBearerAuth()
@UseGuards(JwtAppUserAuthGuard)
@Controller('grocery')
export class GroceryController {
    constructor(private readonly groceryService: GroceryService) { }

    @Get('home')
    @ApiOperation({ summary: 'Get nearby grocery shops' })
    home(@Req() req: any) { return this.groceryService.home(req.user._id); }

    @Get('shop-details')
    @ApiOperation({ summary: 'Get shop details by shopId' })
    shopDetails(@Query() q: ShopDetailsQueryDto) { return this.groceryService.shopDetails(q.shopId); }

    @Get('shop-catalog')
    @ApiOperation({ summary: 'Get full shop catalog' })
    shopCatalog(@Query() q: ShopCatalogQueryDto) { return this.groceryService.shopCatalog(q.shopId, q.search); }

    @Get('product-list')
    @ApiOperation({ summary: 'Get product list for a shop' })
    productList(@Query() q: ProductListQueryDto) {
        return this.groceryService.productList(q.shopId, q.categoryId, q.search);
    }

    @Get('product-details')
    @ApiOperation({ summary: 'Get single product details' })
    productDetails(@Query() q: ProductDetailsQueryDto) { return this.groceryService.productDetails(q.productId); }

    @Post('add-to-cart')
    @ApiOperation({ summary: 'Add item to cart' })
    addToCart(@Req() req: any, @Body() dto: AddToCartDto) {
        return this.groceryService.addToCart(req.user._id, dto.productId, dto.shopId, dto.quantity);
    }

    @Put('add-to-cart')
    @ApiOperation({ summary: 'Update cart item quantity' })
    updateCart(@Req() req: any, @Body() dto: UpdateCartDto) {
        return this.groceryService.updateCart(req.user._id, dto.productId, dto.shopId, dto.quantity);
    }

    @Get('cart-details')
    @ApiOperation({ summary: 'View current cart' })
    cartDetails(@Req() req: any) { return this.groceryService.cartDetails(req.user._id); }

    @Delete('cart-details')
    @ApiOperation({ summary: 'Clear entire cart' })
    clearCart(@Req() req: any) { return this.groceryService.clearCart(req.user._id); }

    @Post('create-order')
    @ApiOperation({ summary: 'Place a grocery order from cart' })
    createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
        return this.groceryService.createOrder(req.user._id, dto);
    }

    @Post('pay')
    @ApiOperation({ summary: 'Make payment for order' })
    pay(@Req() req: any, @Body() dto: PayDto) { return this.groceryService.pay(req.user._id, dto); }

    @Get('orders')
    @ApiOperation({ summary: 'Get order history' })
    orders(@Req() req: any, @Query() q: OrdersQueryDto) { return this.groceryService.orders(req.user._id, q); }

    @Get('order-details')
    @ApiOperation({ summary: 'Get order details by orderId' })
    orderDetails(@Req() req: any, @Query() q: OrderDetailsQueryDto) {
        return this.groceryService.orderDetails(req.user._id, q.orderId);
    }

    @Post('raise-dispute')
    @ApiOperation({ summary: 'Raise a dispute on an order' })
    raiseDispute(@Req() req: any, @Body() dto: RaiseDisputeDto) {
        return this.groceryService.raiseDispute(req.user._id, dto);
    }

    @Post('rating-review')
    @ApiOperation({ summary: 'Submit a rating and review for a shop' })
    ratingReview(@Req() req: any, @Body() dto: RatingReviewDto) {
        return this.groceryService.ratingReview(req.user._id, dto);
    }

    @Get('rating-review')
    @ApiOperation({ summary: 'Get reviews for a shop' })
    getReviews(@Query() q: GetReviewsQueryDto) { return this.groceryService.getReviews(q.shopId); }
}
