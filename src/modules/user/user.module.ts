import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ProviderController } from './provider.controller';
import { UserAddressController } from './user-address.controller';
import { User, UserSchema } from '@mongodb/schemas/user.schema';
import { Review, ReviewSchema } from '@mongodb/schemas/review.schema';
import { SubCategory, SubCategorySchema } from '@mongodb/schemas/sub-category.schema';
import { Banner, BannerSchema } from '@mongodb/schemas/banner.schema';
import { Notification, NotificationSchema } from '@mongodb/schemas/notification.schema';
import { Booking, BookingSchema } from '@mongodb/schemas/booking.schema';
import { AdminSetting, AdminSettingSchema } from '@mongodb/schemas/admin-settings.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Review.name, schema: ReviewSchema },
            { name: SubCategory.name, schema: SubCategorySchema },
            { name: Banner.name, schema: BannerSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: Booking.name, schema: BookingSchema },
            { name: AdminSetting.name, schema: AdminSettingSchema },
        ]),
    ],
    controllers: [UserController, ProviderController, UserAddressController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
