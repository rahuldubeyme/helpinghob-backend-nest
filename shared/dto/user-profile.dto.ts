import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ── Users ──────────────────────────────────────────────────────────────────
export class UpdateUserProfileDto {
    @ApiPropertyOptional() @IsString() @IsOptional() fullName?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() avatar?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() bio?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() gender?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() dob?: string;
}
export class AddNewAddressDto {
    @ApiProperty() @IsString() countryId: string;
    @ApiProperty() @IsString() city: string;
    @ApiProperty() @IsString() addressTag: string;
    @ApiProperty() @IsString() address: string;
    @ApiProperty() @IsString() zipcode: string;
    @ApiProperty() @IsNumber() lat: number;
    @ApiProperty() @IsNumber() lng: number;
    @ApiPropertyOptional() @IsString() @IsOptional() doorNumber?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() streetName?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() locality?: string;
    @ApiPropertyOptional() @IsBoolean() @IsOptional() isPrimary?: boolean;
}
export class EditAddressDto extends AddNewAddressDto {
    @ApiProperty() @IsString() addressId: string;
}
export class HomeListDto {
    @ApiProperty() @IsNumber() page: number;
    @ApiProperty() @IsNumber() perPage: number;
    @ApiProperty() @IsNumber() lat: number;
    @ApiProperty() @IsNumber() lng: number;
    @ApiPropertyOptional() @IsString() @IsOptional() search?: string;
    @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() categoryIds?: string[];
    @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() subCategoryIds?: string[];
    @ApiPropertyOptional() @IsNumber() @IsOptional() rating?: number;
    @ApiPropertyOptional() @IsBoolean() @IsOptional() isFeatured?: boolean;
    @ApiPropertyOptional() @IsString() @IsOptional() scheduleTime?: string;
    @ApiPropertyOptional() @IsNumber() @IsOptional() milesMax?: number;
}
export class UpdateLocationDto {
    @ApiProperty({ type: [Number] }) @IsArray() location: number[];
}
export class AddFavoriteDto {
    @ApiProperty() @IsString() userId: string;
}
export class UpdateUserServicesDto {
    @ApiPropertyOptional() @IsString() @IsOptional() avatar?: string;
    @ApiPropertyOptional({ type: [Object] }) @IsArray() @IsOptional() services?: any[];
    @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
    @ApiPropertyOptional() @IsBoolean() @IsOptional() isPetFriendly?: boolean;
}
