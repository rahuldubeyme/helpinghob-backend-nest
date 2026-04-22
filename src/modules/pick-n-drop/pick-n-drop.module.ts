import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RideController } from './ride/ride.controller';
import { DriverController } from './driver/driver.controller';
import { PaymentController } from './payment/payment.controller';
import { PayoutController } from './payout/payout.controller';
import { VehicleController } from './vehicle/vehicle.controller';
import { MapsModule } from '@shared/maps/maps.module';
import { RideService } from './ride/ride.service';
import { DriverService } from './driver/driver.service';
import { PaymentService } from './payment/payment.service';
import { PayoutService } from './payout/payout.service';
import { VehicleService } from './vehicle/vehicle.service';
import { VerticalBookingService } from '../verticals/vertical-booking.service';
import { LocationModule } from '@shared/location/location.module';
import { SocketModule } from '@socket/socket.module';
import {
    RideRequest, RideRequestSchema,
    User, UserSchema,
    Vehicle, VehicleSchema,
    Review, ReviewSchema,
    Transaction, TransactionSchema,
    Payout, PayoutSchema,
    AdminSetting, AdminSettingSchema,
    CategorySchema,
    Category,
    LiveLocation, LiveLocationSchema
} from '@mongodb/schemas';
import { Booking, BookingSchema } from '@mongodb/schemas/booking.schema';
import { Order, OrderSchema } from '@mongodb/schemas/order.schema';
import { SubCategory, SubCategorySchema } from '@mongodb/schemas/sub-category.schema';
import { Banner, BannerSchema } from '@mongodb/schemas/banner.schema';
import { Coupon, CouponSchema } from '@mongodb/schemas/coupon.schema';

@Module({
    imports: [
        forwardRef(() => SocketModule),
        MapsModule,
        LocationModule,
        MongooseModule.forFeature([
            { name: Vehicle.name, schema: VehicleSchema },
            { name: RideRequest.name, schema: RideRequestSchema },
            { name: User.name, schema: UserSchema },
            { name: Review.name, schema: ReviewSchema },
            { name: Transaction.name, schema: TransactionSchema },
            { name: Payout.name, schema: PayoutSchema },
            { name: AdminSetting.name, schema: AdminSettingSchema },
            { name: Booking.name, schema: BookingSchema },
            { name: Order.name, schema: OrderSchema },
            { name: SubCategory.name, schema: SubCategorySchema },
            { name: Banner.name, schema: BannerSchema },
            { name: Coupon.name, schema: CouponSchema },
            { name: Category.name, schema: CategorySchema },
            { name: LiveLocation.name, schema: LiveLocationSchema },
        ]),
    ],
    controllers: [
        RideController,
        DriverController,
        PaymentController,
        PayoutController,
        VehicleController
    ],
    providers: [
        RideService,
        DriverService,
        PaymentService,
        PayoutService,
        VehicleService,
        VerticalBookingService,
    ],
    exports: [
        RideService,
        DriverService,
        PaymentService,
        PayoutService,
        VehicleService,
        VerticalBookingService,
    ],
})
export class PickNDropModule { }
