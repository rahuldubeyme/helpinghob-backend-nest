import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '@common/decorators';
import { EducationService } from './education.service';
import { InstitutionQueryDto, CreateEducationInquiryDto } from './dto/education.dto';
import { PaginationDto } from '../used-cart/dto/used-cart.dto';

const VERTICAL = 'education';

@ApiTags('Education')
@ApiBearerAuth()
@Controller('education')
export class EducationController {
    constructor(
        private readonly educationService: EducationService
    ) { }

    @Get('institutions')
    @ApiOperation({ summary: 'List educational institutions with filters' })
    findInstitutions(@Query() query: InstitutionQueryDto) {
        return this.educationService.findInstitutions(query);
    }

    @Get('institution/:id')
    @ApiOperation({ summary: 'Get detailed info of a specific institution' })
    findOne(@Param('id') id: string) {
        return this.educationService.findOne(id);
    }

    @Post('inquiry')
    @Auth()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'Submit a student inquiry to an institution' })
    submitInquiry(@Req() req: any, @Body() dto: CreateEducationInquiryDto) {
        return this.educationService.submitInquiry(req.user.id, dto);
    }

    @Get('my-inquiries')
    @Auth()
    @ApiBearerAuth('bearer')
    @ApiOperation({ summary: 'List inquiries submitted by the current user' })
    findMyInquiries(@Req() req: any, @Query() query: PaginationDto) {
        return this.educationService.findMyInquiries(req.user.id, query);
    }

    @Post('seed')
    @ApiOperation({ summary: 'Seed dummy data for education institutions' })
    seedData() {
        return this.educationService.seedData();
    }
}
