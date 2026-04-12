import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OndemandBookingController } from './booking.controller';
import { OndemandBookingService } from './booking.service';
import { User, UserSchema } from '@mongodb/schemas/user.schema';
import { Service, ServiceSchema } from '@mongodb/schemas/service.schema';
import { OndemandBooking, OndemandBookingSchema } from '@mongodb/schemas/ondemand-booking.schema';
import { Earning, EarningSchema } from '@mongodb/schemas/earning.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Service.name, schema: ServiceSchema },
            { name: OndemandBooking.name, schema: OndemandBookingSchema },
            { name: Earning.name, schema: EarningSchema },
        ]),
    ],
    controllers: [OndemandBookingController],
    providers: [OndemandBookingService],
    exports: [OndemandBookingService],
})
export class OndemandBookingModule { }
