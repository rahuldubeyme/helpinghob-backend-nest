import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { StaticService } from './static.service';
import { ApiType } from '@common/decorators/api-type.decorator';
import { Auth, Public } from '@common/decorators';
import { GetStaticPageParamsDto } from './dto/static.dto';
import { USER_ROLE } from '@common/constant';

@ApiTags('Static Contents')
@Controller('static')
export class StaticController {
    constructor(private readonly staticService: StaticService) { }

    @Public()
    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Get()
    @ApiOperation({ summary: 'Get static page by type and role' })
    findPageByType(@Query() params: GetStaticPageParamsDto) {
        return this.staticService.findByType(params.type, params.role);
    }

    @Public()
    @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
    @Get(':id')
    @ApiOperation({ summary: 'Get a static page by ID' })
    findOne(@Param('id') id: string) {
        return this.staticService.findOne(id);
    }
}
