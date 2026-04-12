import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CommonListDto {
  @ApiPropertyOptional({
    example: 'createdAt',
    description: 'Database field to sort by (e.g., name, createdAt, updatedAt)',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    example: 'john',
    description: 'Search keyword for name, email, or compatible fields',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: ['ALL', 'ACTIVE', 'INACTIVE'],
    example: 'ACTIVE',
    description: "Filter by status. Allowed values: 'ALL', 'ACTIVE', 'INACTIVE'",
  })
  @IsOptional()
  @IsEnum(['ALL', 'ACTIVE', 'INACTIVE'])
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({
    example: true,
    description:
      'Enable or disable pagination. If false, all results are returned',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  pagination?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of records to skip (used for pagination)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records to retrieve (used for pagination)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;
}

export class FilterDto extends PartialType(CommonListDto) { }

export class MerchantListDto extends PartialType(CommonListDto) {
  @ApiPropertyOptional({
    example: ['category1', 'category2'],
    required: false,
  })
  @IsOptional()
  category?: string[];

  @ApiPropertyOptional({
    example: ['subcategory1', 'subcategory2'],
    required: false,
  })
  @IsOptional()
  subcategory?: string[];

  @ApiPropertyOptional({
    example: '5km',
    description:
      'Distance filter, typically used when fetching nearby results (e.g., "5km", "10km")',
  })
  @IsOptional()
  @IsString()
  distance?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'Minimum price range filter (e.g., from ₹100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  startPrice?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Maximum price range filter (e.g., up to ₹500)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  endPrice?: number;

  @ApiPropertyOptional({
    example: 'Male',
    description:
      'Filter based on best‑fit criteria (e.g., "Male", "Female", "Both")',
  })
  @IsOptional()
  @IsString()
  bestFitFor?: string;

  @ApiPropertyOptional({
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPrime?: boolean;
}

export class ReviewsListDto {
  @ApiPropertyOptional({
    example: true,
    description:
      'Enable or disable pagination. If false, all results are returned',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  pagination?: boolean;

  @ApiPropertyOptional({
    example: 0,
    description: 'Number of records to skip (used for pagination)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  skip?: number;

  @ApiPropertyOptional({
    example: 10,
    description: 'Number of records to retrieve (used for pagination)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({
    example: 'merchantID',
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  merchantId?: string;
}