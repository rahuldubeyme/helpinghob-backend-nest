import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class RequestPayoutDto {
    @ApiProperty({ example: 500 })
    @IsNotEmpty()
    @IsNumber()
    amount: number;
}
