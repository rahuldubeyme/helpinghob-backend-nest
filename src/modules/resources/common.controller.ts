import { Controller, Get, Param, Query, Post, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ResourcesService } from './resources.service';
import { Public } from '@common/decorators/public.decorator';
import { JwtAppUserAuthGuard } from '@common/guards/jwt-app-user-auth.guard';
import { SubCategoryListDto } from './dto/subcategory-list.dto';

@ApiTags('Common')
@Controller('common')
export class CommonController {
    constructor(private readonly resourcesService: ResourcesService) { }

    // ── Public routes ──────────────────────────────────────────────────────────

    @Public()
    @Get('master-service-list')
    @ApiOperation({ summary: 'Get all master services split into active (ourService) and upcoming' })
    getMasterServiceList() {
        return this.resourcesService.getMasterServiceList();
    }

    @Public()
    @Get('banners')
    @ApiOperation({ summary: 'Get active promotional banners' })
    @ApiQuery({ name: 'search', required: false })
    getBanners(@Query('search') search?: string) {
        return this.resourcesService.getActiveBanners(search);
    }

    @Public()
    @Get('category-list')
    @ApiOperation({ summary: 'Get service categories by masterServiceId with optional keyword search' })
    @ApiQuery({ name: 'masterServiceId', required: true })
    @ApiQuery({ name: 'searchKeyword', required: false })
    getCategoryList(
        @Query('masterServiceId') masterServiceId: string,
        @Query('searchKeyword') searchKeyword?: string,
    ) {
        return this.resourcesService.getCategoryList(masterServiceId, searchKeyword);
    }

    @Public()
    @Post('subcategory-list')
    @ApiOperation({ summary: 'Get subcategories filtered by categoryIds and/or search keyword' })
    getSubCategoryList(@Body() dto: SubCategoryListDto) {
        return this.resourcesService.getSubCategoryList(dto.categoryIds, dto.search);
    }


    @Public()
    @Get('pages/:slug')
    @ApiOperation({ summary: 'Get static page content by slug (e.g. about-us, terms-and-conditions)' })
    getPage(@Param('slug') slug: string) {
        return this.resourcesService.getStaticPage(slug);
    }

    // ── Protected routes ───────────────────────────────────────────────────────

    @Get('notifications')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get authenticated user\'s notification list with sender info' })
    getNotifications(@Req() req: any) {
        return this.resourcesService.getUserNotifications(req.user._id);
    }

    @Post('contact-us')
    @UseGuards(JwtAppUserAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Submit a support/contact-us request' })
    contactUs(@Req() req: any, @Body() body: any) {
        //return this.resourcesService.saveContactInquiry(body, req.user._id);
    }
}
