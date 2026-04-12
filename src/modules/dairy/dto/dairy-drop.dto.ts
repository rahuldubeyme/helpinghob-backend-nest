import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Dairy-Drop Provider Profile ────────────────────────────────────────────
export class CreateShopProfileDto {
    @ApiProperty() @IsString() shopName: string;
    @ApiProperty() @IsString() shopAddress: string;
    @ApiProperty() @IsNumber() lat: number;
    @ApiProperty() @IsNumber() lng: number;
    @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() banner?: string;
}
export class UpdateShopProfileDto extends CreateShopProfileDto { }

export class CreateOwnerProfileDto {
    @ApiProperty() @IsString() fullName: string;
    @ApiProperty() @IsString() mobile: string;
    @ApiPropertyOptional() @IsString() @IsOptional() avatar?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() idProof?: string;
}
export class UpdateOwnerProfileDto extends CreateOwnerProfileDto { }

// ── Products ───────────────────────────────────────────────────────────────
export class GetCommonProductListQueryDto {
    @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
    @ApiPropertyOptional() @IsNumber() @IsOptional() page?: number;
}
export class SelectCommonProductsDto {
    @ApiProperty({ type: [String] }) @IsArray() productIds: string[];
}
export class AddProductDto {
    @ApiProperty() @IsString() name: string;
    @ApiProperty() @IsNumber() price: number;
    @ApiProperty() @IsString() unit: string;
    @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() image?: string;
    @ApiPropertyOptional() @IsBoolean() @IsOptional() isAvailable?: boolean;
}
export class UpdateProductDto extends AddProductDto {
    @ApiProperty() @IsString() productId: string;
}
export class DeleteProductQueryDto {
    @ApiProperty() @IsString() productId: string;
}
export class GetProductListQueryDto {
    @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
    @ApiPropertyOptional() @IsNumber() @IsOptional() page?: number;
}
export class GetProductDetailsQueryDto {
    @ApiProperty() @IsString() productId: string;
}

// ── Inventory ──────────────────────────────────────────────────────────────
export class GetInventoryQueryDto {
    @ApiPropertyOptional() @IsString() @IsOptional() date?: string;
}
export class UpdateInventoryDto {
    @ApiProperty({ type: [Object] }) items: { productId: string; quantity: number }[];
}

// ── Orders ─────────────────────────────────────────────────────────────────
export class GetOrdersQueryDto {
    @ApiPropertyOptional() @IsString() @IsOptional() status?: string;
    @ApiPropertyOptional() @IsNumber() @IsOptional() page?: number;
}
export class UpdateOrderStatusDto {
    @ApiProperty() @IsString() orderId: string;
    @ApiProperty() @IsString() status: string;
}

// ── Earnings / Ratings ─────────────────────────────────────────────────────
export class GetEarningsQueryDto {
    @ApiPropertyOptional() @IsString() @IsOptional() startDate?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() endDate?: string;
}
export class GetRatingsQueryDto {
    @ApiPropertyOptional() @IsNumber() @IsOptional() page?: number;
}
