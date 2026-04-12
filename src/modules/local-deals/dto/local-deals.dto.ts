import { ApiProperty } from '@nestjs/swagger';

export class LocalDealsFilterDto {
    @ApiProperty({ required: false })
    categoryId?: string;

    @ApiProperty({ required: false, enum: ['active', 'expired', 'upcoming'] })
    status?: string;

    @ApiProperty({ required: false })
    search?: string;

    @ApiProperty({ required: false, default: 1 })
    page?: number;

    @ApiProperty({ required: false, default: 10 })
    limit?: number;
}
