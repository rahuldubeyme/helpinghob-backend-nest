import { Controller, Get, Query, Delete, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { S3Service } from './util.service';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';

@ApiTags('Utilities')
@Controller('util')
export class UtilController {
    constructor(private readonly s3Service: S3Service) { }

    @Get('upload-url')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate S3 presigned upload URLs' })
    @ApiResponse({ status: 200, description: 'URLs generated successfully' })
    async getUploadUrls(
        @Query('location') location: string,
        @Query('type') type: string,
        @Query('count') count: number = 1
    ) {
        return await this.s3Service.getPresignedUploadUrls(location, type, Number(count));
    }

    @Delete('file')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete a file from S3' })
    async deleteFile(@Body('key') key: string) {
        return await this.s3Service.deleteFile(key);
    }
}
