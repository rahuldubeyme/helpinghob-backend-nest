import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GroceryController } from './grocery.controller';
import { GroceryService } from './grocery.service';
import { Order, OrderSchema } from '@mongodb/schemas/order.schema';
import { Product, ProductSchema } from '@mongodb/schemas/product.schema';
import { Review, ReviewSchema } from '@mongodb/schemas/review.schema';
import { User, UserSchema } from '@mongodb/schemas/user.schema';
import { Merchant, MerchantSchema } from '@mongodb/schemas/merchant.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Order.name, schema: OrderSchema },
            { name: Product.name, schema: ProductSchema },
            { name: Review.name, schema: ReviewSchema },
            { name: User.name, schema: UserSchema },
            { name: Merchant.name, schema: MerchantSchema },
        ]),
    ],
    controllers: [GroceryController],
    providers: [GroceryService],
    exports: [GroceryService],
})
export class GroceryModule { }
