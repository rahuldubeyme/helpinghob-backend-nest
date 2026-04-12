import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResourcesController } from './resources.controller';
import { CommonController } from './common.controller';
import { ResourcesService } from './resources.service';
import { AdminSetting, AdminSettingSchema } from '@mongodb/schemas/admin-settings.schema';
import { Faq, FaqSchema } from '@mongodb/schemas/faq.schema';
import { Banner, BannerSchema } from '@mongodb/schemas/banner.schema';
import { Notification, NotificationSchema } from '@mongodb/schemas/notification.schema';
import { StaticPages, StaticPagesSchema } from '@mongodb/schemas/static-pages.schema';
import { MasterService, MasterServiceSchema } from '@mongodb/schemas/master-service.schema';
import { SubCategory, SubCategorySchema } from '@mongodb/schemas/sub-category.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdminSetting.name, schema: AdminSettingSchema },
      { name: Faq.name, schema: FaqSchema },
      { name: Banner.name, schema: BannerSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: StaticPages.name, schema: StaticPagesSchema },
      { name: MasterService.name, schema: MasterServiceSchema },
      { name: SubCategory.name, schema: SubCategorySchema },
    ]),
  ],
  controllers: [ResourcesController, CommonController],
  providers: [ResourcesService],
  exports: [ResourcesService],
})
export class ResourcesModule { }
