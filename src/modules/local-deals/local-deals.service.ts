import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '@mongodb/schemas/service.schema';
import { Merchant, MerchantDocument } from '@mongodb/schemas/merchant.schema';
import { Booking, BookingDocument } from '@mongodb/schemas/booking.schema';

@Injectable()
export class LocalDealsService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    ) { }

    async getHomeDeals(query: any) {
        return await this.serviceModel.find({ isDeleted: false, dealPrice: { $exists: true } }).limit(10).lean();
    }

    async getDealsByMerchant(merchantId: string) {
        if (!Types.ObjectId.isValid(merchantId)) {
            throw new Error('Invalid Merchant ID');
        }
        return await this.serviceModel.find({ merchantId: new Types.ObjectId(merchantId), isDeleted: false }).lean();
    }

    async getCategories() {
        // Placeholder for deal categories
        return { success: true, categories: [] };
    }
}
