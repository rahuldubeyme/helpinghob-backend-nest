import { IsArray, IsMongoId, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubCategoryListDto {
    @ApiProperty({
        example: ['664f1c2e8a1b2c3d4e5f6a7b', '664f1c2e8a1b2c3d4e5f6a7c'],
        description: 'Filter by one or more category IDs',
        type: [String],
        required: false,
    })
    @IsArray()
    @IsMongoId({ each: true })
    @IsOptional()
    categoryIds?: string[];

    @ApiProperty({ example: 'cleaning', description: 'Keyword to search by title', required: false })
    @IsString()
    @IsOptional()
    search?: string;
}
