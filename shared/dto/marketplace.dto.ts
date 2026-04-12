import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ShopDetailsQueryDto {
    @ApiProperty() @IsString() shopId: string;
}
export class ShopCatalogQueryDto {
    @ApiProperty() @IsString() shopId: string;
    @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
}
export class ProductListQueryDto {
    @ApiProperty() @IsString() shopId: string;
    @ApiPropertyOptional() @IsString() @IsOptional() categoryId?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
}
export class ProductDetailsQueryDto {
    @ApiProperty() @IsString() productId: string;
}
export class AddToCartDto {
    @ApiProperty() @IsString() productId: string;
    @ApiProperty() @IsNumber() quantity: number;
    @ApiProperty() @IsString() shopId: string;
}
export class UpdateCartDto extends AddToCartDto { }
export class CreateOrderDto {
    @ApiProperty() @IsString() shopId: string;
    @ApiProperty() @IsString() addressId: string;
    @ApiPropertyOptional() @IsString() @IsOptional() couponCode?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() instructions?: string;
}
export class PayDto {
    @ApiProperty() @IsString() orderId: string;
    @ApiProperty() @IsString() paymentMethod: string;
}
export class OrdersQueryDto {
    @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
    @ApiPropertyOptional() @IsNumber() @IsOptional() page?: number;
    @ApiPropertyOptional() @IsNumber() @IsOptional() perPage?: number;
}
export class OrderDetailsQueryDto {
    @ApiProperty() @IsString() orderId: string;
}
export class RaiseDisputeDto {
    @ApiProperty() @IsString() orderId: string;
    @ApiProperty() @IsString() reason: string;
    @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
}
export class RatingReviewDto {
    @ApiProperty() @IsString() orderId: string;
    @ApiProperty() @IsString() shopId: string;
    @ApiProperty() @IsNumber() rating: number;
    @ApiPropertyOptional() @IsString() @IsOptional() review?: string;
}
export class GetReviewsQueryDto {
    @ApiProperty() @IsString() shopId: string;
}
