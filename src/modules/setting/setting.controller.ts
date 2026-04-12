import { Body, Controller, Delete, Get, Put } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UpdateProfileDto } from './dto/profile.dto';
import { ApiType, Auth, CurrentUser, Public } from '@common/decorators';
import { ROLE, USER_ROLE } from '@common/constant';


@ApiTags('Settings & Profile')
@Controller('setting')
export class SettingController {
  constructor(private readonly settingService: SettingService) { }

  @Get('profile')
  @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
  @Auth(ROLE.USER, ROLE.PROVIDER)
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: any) {
    return this.settingService.getProfile(user.id, user.role);
  }

  @Put('profile')
  @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
  @Auth(ROLE.USER, ROLE.PROVIDER)
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(@CurrentUser() user: any, @Body() profileDto: UpdateProfileDto) {
    return this.settingService.updateProfile(user.id, user.role, profileDto);
  }

  @Delete('delete-account')
  @ApiType([USER_ROLE.USER, USER_ROLE.PROVIDER])
  @Auth(ROLE.USER, ROLE.PROVIDER)
  @ApiOperation({ summary: 'Delete account' })
  remove(@CurrentUser() user: any) {
    return this.settingService.deleteAccount(user.id, user.role);
  }

  @Public()
  @Get('admin-settings')
  @ApiOperation({ summary: 'Get global admin settings' })
  getAdminSettings() {
    return this.settingService.getAdminSettings();
  }
}
