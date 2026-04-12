import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsedCartController } from './used-cart.controller';
import { UsedCartService } from './used-cart.service';
import { UsedItem, UsedItemSchema, UsedOffer, UsedOfferSchema } from '@shared/mongodb/schemas';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: UsedItem.name, schema: UsedItemSchema },
            { name: UsedOffer.name, schema: UsedOfferSchema },
        ]),
    ],
    controllers: [UsedCartController],
    providers: [UsedCartService],
    exports: [UsedCartService],
})
export class UsedCartModule { }
