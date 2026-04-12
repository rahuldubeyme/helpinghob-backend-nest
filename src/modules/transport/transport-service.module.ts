import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TransportServiceController } from './transport-service.controller';
import { VerticalBookingService } from '../verticals/vertical-booking.service';
import { User, UserSchema } from '@mongodb/schemas/user.schema';
import { Booking, BookingSchema } from '@mongodb/schemas/booking.schema';
import { Order, OrderSchema } from '@mongodb/schemas/order.schema';
import { Review, ReviewSchema } from '@mongodb/schemas/review.schema';
import { ServiceCategory, ServiceCategorySchema } from '@mongodb/schemas/service-category.schema';
import { SubCategory, SubCategorySchema } from '@mongodb/schemas/sub-category.schema';
import { Banner, BannerSchema } from '@mongodb/schemas/banner.schema';
import { Coupon, CouponSchema } from '@mongodb/schemas/coupon.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Booking.name, schema: BookingSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Review.name, schema: ReviewSchema },
            { name: ServiceCategory.name, schema: ServiceCategorySchema },
            { name: SubCategory.name, schema: SubCategorySchema },
            { name: Banner.name, schema: BannerSchema },
            { name: Coupon.name, schema: CouponSchema },
        ]),
    ],
    controllers: [TransportServiceController],
    providers: [VerticalBookingService],
    exports: [VerticalBookingService],
})
export class TransportServiceModule { }
