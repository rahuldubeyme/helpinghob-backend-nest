import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DairyDropController } from './dairy-drop.controller';
import { DairyDropService } from './dairy-drop.service';
import { User, UserSchema } from '@mongodb/schemas/user.schema';
import { Product, ProductSchema } from '@mongodb/schemas/product.schema';
import { Order, OrderSchema } from '@mongodb/schemas/order.schema';
import { Review, ReviewSchema } from '@mongodb/schemas/review.schema';
import { Merchant, MerchantSchema } from '@mongodb/schemas/merchant.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
            { name: Product.name, schema: ProductSchema },
            { name: Order.name, schema: OrderSchema },
            { name: Review.name, schema: ReviewSchema },
            { name: Merchant.name, schema: MerchantSchema },
        ]),
    ],
    controllers: [DairyDropController],
    providers: [DairyDropService],
    exports: [DairyDropService],
})
export class DairyDropModule { }
