import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';
import { User, UserSchema } from '@mongodb/schemas/user.schema';
import { AdminSetting, AdminSettingSchema } from '@mongodb/schemas/admin-settings.schema';
import { Booking, BookingSchema } from '@mongodb/schemas/booking.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: AdminSetting.name, schema: AdminSettingSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [SettingController],
  providers: [SettingService],
  exports: [SettingService],
})
export class SettingModule { }
