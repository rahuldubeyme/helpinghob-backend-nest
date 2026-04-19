import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class ProcessPaymentDto {

    @ApiProperty({ example: '694687646464646464646464' })
    @IsNotEmpty()
    @IsString()
    rideId: string;

    @ApiProperty({ example: 'CASH', enum: ['CASH', 'WALLET', 'UPI'] })
    @IsNotEmpty()
    @IsString()
    method: string;

    @ApiProperty({ example: true })
    @IsNotEmpty()
    @IsBoolean()
    isCollected: boolean;
}
