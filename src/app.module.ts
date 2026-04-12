import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Import Shared Root Modules
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import Monolith Modules
import { ResourcesModule } from '@modules/resources/resources.module';

import { BookingModule } from '@modules/dairy/modules/booking/booking.module';
import { SettingModule } from '@modules/setting/setting.module';
import { DatabaseModule } from '@mongodb/database.module';
import { I18nModule } from '@i18n/i18n.module';
import { RateLimitModule } from '@rate-limit/rate-limit.module';
import { SocketModule } from '@socket/socket.module';
import { AuthModule } from '@modules/auth/auth.module';
import { MailModule } from '@shared/mail/mail.module';
import { SmsModule } from '@shared/sms/sms.module';
import { FcmModule } from '@shared/fcm/fcm.module';
import { OndemandServiceModule } from '@modules/ondemand/ondemand.module';
import { OndemandBookingModule } from '@modules/ondemand/booking/booking.module';
import { FoodDeliveryModule } from '@modules/food-delivery/food-delivery.module';
import { PickNDropModule } from '@modules/pick-n-drop/pick-n-drop.module';
import { GroceryModule } from '@modules/grocery/grocery.module';
import { TransportServiceModule } from '@modules/transport/transport-service.module';
import { DairyDropModule } from '@modules/dairy/dairy-drop.module';
import { EducationModule } from '@modules/education/education.module';
import { HardwareShopModule } from '@modules/local-shop/hardware-shop.module';
import { LocalDealsModule } from '@modules/local-deals/local-deals.module';
import { UserModule } from '@modules/user/user.module';
import { UtilModule } from '@modules/util/util.module';
import { WebModule } from '@modules/web/web.module';
import { UsedCartModule } from '@modules/used-cart/used-cart.module';

import { LanguageInterceptor, MetadataInterceptor, ResponseInterceptor } from '@interceptors/index';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env'],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    MailModule,
    SmsModule,
    FcmModule,

    I18nModule,
    RateLimitModule,
    SocketModule,

    // Direct Logic Modules (Monolith)
    AuthModule,
    BookingModule,
    SettingModule,
    ResourcesModule,
    OndemandServiceModule,
    OndemandBookingModule,
    FoodDeliveryModule,
    PickNDropModule,
    GroceryModule,
    TransportServiceModule,
    DairyDropModule,
    EducationModule,
    HardwareShopModule,
    LocalDealsModule,
    UserModule,
    UtilModule,
    WebModule,
    UsedCartModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: MetadataInterceptor, // First: extract x-platform, x-app-version, x-lang
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LanguageInterceptor,
    },
  ],
})
export class AppModule { }
