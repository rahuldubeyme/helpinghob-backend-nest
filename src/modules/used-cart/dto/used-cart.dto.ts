import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, MaxLength, Min, Max } from 'class-validator';

export class CreateUsedItemDto {
    @ApiProperty({ example: 'iPhone 13 Pro' })
    @IsString()
    title: string;

    @ApiProperty({ example: 'Phone' })
    @IsString()
    category: string;

    @ApiProperty({ example: 'Like new condition, 128GB, no scratches.' })
    @IsString()
    description: string;

    @ApiProperty({ example: 'new', enum: ['new', 'fair', 'like new'] })
    @IsString()
    condition: string;

    @ApiProperty({ example: '45000' })
    @IsString()
    expectedPrice: string;

    @ApiProperty({ example: '2022' })
    @IsString()
    @IsOptional()
    yearOfPurchase?: string;

    @ApiProperty({ type: [String], description: 'Max 10 images' })
    @IsArray()
    @IsString({ each: true })
    images: string[];

    @ApiProperty({ example: 'Mumbai, Maharashtra' })
    @IsString()
    address: string;

    @ApiProperty({ type: [Number], example: [19.076, 72.8777] })
    @IsArray()
    @IsNumber({}, { each: true })
    location: number[];
}

export class CreateUsedOfferDto {
    @ApiProperty({ example: '60f1...' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: 40000 })
    @IsNumber()
    @Min(0)
    offeredPrice: number;
}

export class UpdateOfferStatusDto {
    @ApiProperty({ example: 'accepted', enum: ['accepted', 'rejected'] })
    @IsString()
    status: string;
}

export class PaginationDto {
    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ example: 10 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    limit?: number = 10;
}

export class UsedItemQueryDto extends PaginationDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    condition?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    minPrice?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    maxPrice?: string;

    @ApiPropertyOptional({ example: 'newest', enum: ['newest', 'oldest', 'priceAsc', 'priceDesc'] })
    @IsOptional()
    @IsString()
    sort?: string;
}
