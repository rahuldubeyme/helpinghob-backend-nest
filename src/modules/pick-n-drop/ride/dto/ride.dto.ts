import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LocationDto } from '../../dto/common.dto';

export class BookRideDto {
    @ApiProperty({
        type: LocationDto,
        example: {
            lat: 19.0760,
            lng: 72.8777,
            address: 'Mumbai International Airport'
        }
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    source: LocationDto;

    @ApiProperty({
        type: LocationDto,
        example: {
            lat: 18.9220,
            lng: 72.8347,
            address: 'Gateway of India, Mumbai'
        }
    })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    destination: LocationDto;

    @ApiProperty({ example: '69c3e6c0bfe3fe1c56ba3ead' })
    @IsNotEmpty()
    @IsString()
    vehicleId: string;

    @ApiProperty({ example: '65c3e6c0bfe3fe1c56ba3eaf' })
    @IsNotEmpty()
    @IsString()
    driverId: string;

    @ApiProperty({ example: 250 })
    @IsNotEmpty()
    @IsNumber()
    totalFare: number;
}

export class CreateRideDto {
    @ApiProperty({ example: '65c3e6c0bfe3fe1c56ba3eaf', required: false })
    @IsOptional()
    @IsString()
    driverId?: string;
}

export class UpdateRideStatusDto {
    @ApiProperty({ example: 'reached/started/completed/cancelled' })
    @IsNotEmpty()
    @IsString()
    status: string;

    @ApiProperty({ example: '69e4141380600972892a5f32' })
    @IsNotEmpty()
    @IsString()
    rideId: string;

    @ApiProperty({ example: 'Issue raised' })
    @IsOptional()
    @IsString()
    cancellationReason?: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: '69e4141380600972892a5f32' })
    @IsNotEmpty()
    @IsString()
    rideId: string;

    @ApiProperty({ example: '1234' })
    @IsNotEmpty()
    @IsString()
    otp: string;
}

export class ChangeDestinationDto {
    @ApiProperty({ type: LocationDto })
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => LocationDto)
    destination: LocationDto;

    @ApiProperty({ example: '69e4141380600972892a5f32' })
    @IsNotEmpty()
    @IsString()
    rideId: string;
}

export class CancelRideDto {
    @ApiProperty({ example: 'Client changed mind' })
    @IsNotEmpty()
    @IsString()
    reason: string;
}

export class ReportDisputeDto {

    @ApiProperty({ example: '69e4141380600972892a5f32' })
    @IsNotEmpty()
    @IsString()
    rideId: string;

    @ApiProperty({ example: 'Incorrect Fare' })
    @IsNotEmpty()
    @IsString()
    reason: string;

    @ApiProperty({ example: 'Driver charged extra than estimated' })
    @IsNotEmpty()
    @IsString()
    description: string;
}

export class SubmitReviewDto {
    @ApiProperty({ example: '65c3e6c0bfe3fe1c56ba3eac' })
    @IsNotEmpty()
    @IsString()
    rideId: string;

    @ApiProperty({ example: '65c3e6c0bfe3fe1c56ba3eaf' })
    @IsNotEmpty()
    @IsString()
    driverId: string;

    @ApiProperty({ example: 5 })
    @IsNotEmpty()
    @IsNumber()
    rating: number;

    @ApiProperty({ example: 'Great driver!' })
    @IsOptional()
    @IsString()
    comment?: string;
}

export class RideActionDto {
    @ApiProperty({ example: 'accept', enum: ['accept', 'reject'] })
    @IsNotEmpty()
    @IsString()
    action: 'accept' | 'reject';

    @ApiProperty({ example: '69e4141380600972892a5f32' })
    @IsNotEmpty()
    @IsString()
    rideId: string;
}
