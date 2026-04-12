import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsNumber, IsArray } from 'class-validator';

export class UpdateShopDto {
    @ApiPropertyOptional({ example: 'My Awesome Shop' })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ example: '5 years' })
    @IsString()
    @IsOptional()
    experience?: string;

    @ApiPropertyOptional({ example: '500' })
    @IsString()
    @IsOptional()
    serviceCharge?: string;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isMaterialInclude?: boolean;

    @ApiPropertyOptional({ example: 'Specialist' })
    @IsString()
    @IsOptional()
    profecienceType?: string;

    @ApiPropertyOptional({ example: 'We provide best services' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ example: '123 Street, City' })
    @IsString()
    @IsOptional()
    address?: string;
}

export class UpdateVehicleDto {
    @ApiPropertyOptional({ example: 'Bike' })
    @IsString()
    @IsOptional()
    type?: string;

    @ApiPropertyOptional({ example: 'Honda' })
    @IsString()
    @IsOptional()
    model?: string;

    @ApiPropertyOptional({ example: 'ABC-123' })
    @IsString()
    @IsOptional()
    numberPlate?: string;

    @ApiPropertyOptional({ example: 'Red' })
    @IsString()
    @IsOptional()
    color?: string;

    @ApiPropertyOptional({ example: '2023' })
    @IsString()
    @IsOptional()
    year?: string;
}

export class UpdateAvailabilityDto {
    @ApiProperty({ example: 'Online', enum: ['Online', 'Offline', 'Busy'] })
    @IsString()
    @IsOptional()
    status: string;
}

export class UpdateLocationDto {
    @ApiProperty({ example: [77.1025, 28.7041], description: '[longitude, latitude]' })
    @IsArray()
    location: number[];
}
