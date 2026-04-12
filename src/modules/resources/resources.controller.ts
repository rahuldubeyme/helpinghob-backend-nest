import { Body, Controller, Get, Param, Post, Put, Query, } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiType } from "@common/decorators/api-type.decorator";
import { Public } from '@common/decorators/public.decorator';
import { UploadFilesDto } from "./dto/s3url.dto";
import { ROLE, USER_ROLE } from '@common/constant';
import { Auth } from '@common/decorators';


@ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER]) // swagger
@ApiTags('Resources')
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) { }

  @ApiOperation({ summary: 'S3 presigned upload urls' })
  @Get('s3-upload-urls')
  @Auth(ROLE.USER, USER_ROLE.PROVIDER)
  async generateS3UploadUrls(@Query() uploadFilesDto: UploadFilesDto) {
    return this.resourcesService.S3PreUploadUrl(uploadFilesDto);
  }


  // merchant category
  @Post('business-category')
  @Auth(ROLE.USER, USER_ROLE.PROVIDER)
  @ApiOperation({ summary: 'Create a service category' })
  createCat(@Body() dto: any) {
    return this.resourcesService.createCategory(dto);
  }

  @Get('business-category')
  @Auth(ROLE.USER, USER_ROLE.PROVIDER)
  @ApiOperation({ summary: 'Get all service categories' })
  findAllCat() {
    return this.resourcesService.findAllCategory();
  }

  @Get('business-category/:id')
  @Auth(ROLE.USER)
  @ApiOperation({ summary: 'Get a service category' })
  findOneCat(@Param('id') id: string) {
    return this.resourcesService.findOneCategory(id);
  }

  @Put('business-category/:id')
  @Auth(ROLE.USER, ROLE.PROVIDER)
  @ApiOperation({ summary: 'Update a service category' })
  updateCat(@Param('id') id: string, @Body() dto: any) {
    return this.resourcesService.updateCategory(id, dto);
  }

  @Public()
  @Get('faq')
  @ApiOperation({ summary: 'Get all faq' })
  faq() {
    return this.resourcesService.findAllfaq();
  }
}
