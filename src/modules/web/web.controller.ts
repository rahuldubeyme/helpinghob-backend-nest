import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebService } from './web.service';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('Web - Landing Page')
@Controller('web')
export class WebController {
    constructor(private readonly webService: WebService) { }

    @Public()
    @Get('service-list')
    @ApiOperation({ summary: 'Get optimized service list for web landing page' })
    @ApiResponse({ status: 200, description: 'Service list fetched successfully' })
    async getServiceList() {
        return await this.webService.getWebServiceList();
    }

    @Public()
    @Post('contact-us')
    @ApiOperation({ summary: 'Submit contact-us form from web landing page' })
    async contactUs(@Body() body: any) {
        return await this.webService.saveWebInquiry(body);
    }
}
