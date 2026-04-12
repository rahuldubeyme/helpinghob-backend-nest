import { Body, Controller, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsedCartService } from './used-cart.service';
import { CreateUsedItemDto, CreateUsedOfferDto, UsedItemQueryDto, UpdateOfferStatusDto, PaginationDto } from './dto/used-cart.dto';
import { Auth } from '@common/decorators';

@ApiTags('Used Cart (Marketplace)')
@Controller('used-cart')
export class UsedCartController {
    constructor(private readonly usedCartService: UsedCartService) { }

    @Post('post-ad')
    @Auth()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Post a new ad for a used product' })
    @ApiResponse({ status: 201, description: 'Ad posted successfully' })
    postAd(@Req() req: any, @Body() dto: CreateUsedItemDto) {
        return this.usedCartService.postAd(req.user.id, dto);
    }

    @Post('make-offer')
    @Auth()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Make an offer for a used product' })
    @ApiResponse({ status: 201, description: 'Offer submitted successfully' })
    makeOffer(@Req() req: any, @Body() dto: CreateUsedOfferDto) {
        return this.usedCartService.makeOffer(req.user.id, dto);
    }

    @Get('my-items')
    @Auth()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'List all ads posted by the current user' })
    findMyItems(@Req() req: any, @Query() query: PaginationDto) {
        return this.usedCartService.findMyItems(req.user.id, query);
    }

    @Get('item-offers/:itemId')
    @Auth()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'List all offers received for a specific ad posted by the current user' })
    findOffersForItem(@Req() req: any, @Param('itemId') itemId: string, @Query() query: PaginationDto) {
        return this.usedCartService.findOffersForItem(req.user.id, itemId, query);
    }

    @Patch('offer-status/:offerId')
    @Auth()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Accept or reject an offer for a used product' })
    @ApiResponse({ status: 200, description: 'Offer status updated successfully' })
    updateOfferStatus(
        @Req() req: any,
        @Param('offerId') offerId: string,
        @Body() dto: import('./dto/used-cart.dto').UpdateOfferStatusDto
    ) {
        return this.usedCartService.updateOfferStatus(req.user.id, offerId, dto.status);
    }

    @Get('items')
    @ApiOperation({ summary: 'List all used items with search, filter, and sorting' })
    findAll(@Query() query: UsedItemQueryDto) {
        return this.usedCartService.findAll(query);
    }

    @Get('item/:id')
    @ApiOperation({ summary: 'Get details of a specific used item' })
    findOne(@Param('id') id: string) {
        return this.usedCartService.findOne(id);
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed dummy data for used items and offers' })
    seedData() {
        return this.usedCartService.seedData();
    }
}
