import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ProcessPaymentDto {
    @ApiProperty({ example: 'CASH', enum: ['CASH', 'WALLET', 'UPI'] })
    @IsNotEmpty()
    @IsString()
    method: string;
}
