import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UsedItem, UsedItemDocument, UsedOffer, UsedOfferDocument } from '@shared/mongodb/schemas';
import { CreateUsedItemDto, CreateUsedOfferDto, UsedItemQueryDto } from './dto/used-cart.dto';

@Injectable()
export class UsedCartService {
    constructor(
        @InjectModel(UsedItem.name) private usedItemModel: Model<UsedItemDocument>,
        @InjectModel(UsedOffer.name) private usedOfferModel: Model<UsedOfferDocument>,
    ) { }

    async postAd(userId: string, dto: CreateUsedItemDto): Promise<UsedItem> {
        const newItem = new this.usedItemModel({
            ...dto,
            userId: new Types.ObjectId(userId),
        });
        return newItem.save();
    }

    async makeOffer(userId: string, dto: CreateUsedOfferDto): Promise<UsedOffer> {
        const item = await this.usedItemModel.findById(dto.itemId);
        if (!item) {
            throw new NotFoundException('Item not found');
        }

        const newOffer = new this.usedOfferModel({
            ...dto,
            itemId: new Types.ObjectId(dto.itemId),
            userId: new Types.ObjectId(userId),
        });
        return newOffer.save();
    }

    async findAll(query: UsedItemQueryDto) {
        const { search, category, condition, minPrice, maxPrice, sort, page = 1, limit = 10 } = query;
        const skip = (+page - 1) * +limit;
        const filter: any = { isDeleted: false, isSuspended: false, isSold: false };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (condition) {
            filter.condition = condition;
        }

        if (minPrice || maxPrice) {
            filter.expectedPrice = {};
            if (minPrice) filter.expectedPrice.$gte = minPrice;
            if (maxPrice) filter.expectedPrice.$lte = maxPrice;
        }

        let sortOption: any = { created: -1 };
        if (sort) {
            switch (sort) {
                case 'newest': sortOption = { created: -1 }; break;
                case 'oldest': sortOption = { created: 1 }; break;
                case 'priceAsc': sortOption = { expectedPrice: 1 }; break;
                case 'priceDesc': sortOption = { expectedPrice: -1 }; break;
            }
        }

        const total = await this.usedItemModel.countDocuments(filter);
        const items = await this.usedItemModel.find(filter).sort(sortOption).skip(skip).limit(+limit).exec();

        return { items, total, page: +page, limit: +limit };
    }

    async findMyItems(userId: string, query: any) {
        const { page = 1, limit = 10 } = query;
        const skip = (+page - 1) * +limit;
        const filter = { userId: new Types.ObjectId(userId), isDeleted: false };

        const total = await this.usedItemModel.countDocuments(filter);
        const items = await this.usedItemModel.find(filter)
            .sort({ created: -1 })
            .skip(skip)
            .limit(+limit)
            .exec();

        return { items, total, page: +page, limit: +limit };
    }

    async findOffersForItem(userId: string, itemId: string, query: any) {
        const { page = 1, limit = 10 } = query;
        const skip = (+page - 1) * +limit;

        // First verify the item belongs to the user
        const item = await this.usedItemModel.findOne({ _id: new Types.ObjectId(itemId), userId: new Types.ObjectId(userId) });
        if (!item) {
            throw new NotFoundException('Item not found or you do not have permission to view offers for it');
        }

        const filter = { itemId: new Types.ObjectId(itemId) };
        const total = await this.usedOfferModel.countDocuments(filter);
        const items = await this.usedOfferModel.find(filter)
            .populate('userId', 'fullName mobile')
            .sort({ created: -1 })
            .skip(skip)
            .limit(+limit)
            .exec();

        return { items, total, page: +page, limit: +limit };
    }

    async updateOfferStatus(userId: string, offerId: string, status: string) {
        const offer = await this.usedOfferModel.findById(offerId).populate('itemId');
        if (!offer) {
            throw new NotFoundException('Offer not found');
        }

        const item = offer.itemId as any; // Due to populate
        if (item.userId.toString() !== userId) {
            throw new NotFoundException('You do not have permission to manage this offer');
        }

        offer.status = status;
        await offer.save();

        if (status === 'accepted') {
            await this.usedItemModel.findByIdAndUpdate(item._id, { isSold: true });
            // Optionally reject all other offers for this item
            await this.usedOfferModel.updateMany(
                { itemId: item._id, _id: { $ne: new Types.ObjectId(offerId) } },
                { status: 'rejected' }
            );
        }

        return offer;
    }

    async findOne(id: string): Promise<UsedItem> {
        const item = await this.usedItemModel.findById(id).exec();
        if (!item || item.isDeleted) {
            throw new NotFoundException('Item not found');
        }
        return item;
    }

    async seedData() {
        // Dummy users (based on database check)
        const user1 = new Types.ObjectId('69d94d2bf10fc6b0a0e5387d');
        const user2 = new Types.ObjectId('69d94e46f10fc6b0a0e538d5');

        // Clear existing (optional, but good for clean seed)
        // await this.usedItemModel.deleteMany({ userId: { $in: [user1, user2] } });
        // await this.usedOfferModel.deleteMany({});

        const items = [
            {
                userId: user1,
                title: 'iPhone 13 Pro',
                category: 'Phone',
                description: 'Superb condition, 128GB, Sierra Blue.',
                condition: 'like new',
                expectedPrice: '45000',
                images: ['https://images.unsplash.com/photo-1632661674596-df8be070a5c5'],
                address: 'Andheri West, Mumbai',
                location: [19.1136, 72.8697],
            },
            {
                userId: user1,
                title: 'Honda City 2018 i-VTEC',
                category: 'Car',
                description: 'Single owner, well maintained, 45k km done.',
                condition: 'fair',
                expectedPrice: '650000',
                images: ['https://images.unsplash.com/photo-1511919884226-fd3cad34687c'],
                address: 'Goregaon East, Mumbai',
                location: [19.1634, 72.8412],
            },
            {
                userId: user2,
                title: 'Solid Oak Dining Table',
                category: 'Furniture',
                description: '6 seater, almost new, sold with 4 chairs.',
                condition: 'new',
                expectedPrice: '25000',
                images: ['https://images.unsplash.com/photo-1577145745727-42b77da20455'],
                address: 'Bandra West, Mumbai',
                location: [19.0596, 72.8295],
            },
            {
                userId: user1,
                title: 'MacBook Air M1',
                category: 'Laptop',
                description: 'Used for 6 months, original bill and box.',
                condition: 'like new',
                expectedPrice: '62000',
                images: ['https://images.unsplash.com/photo-1611186871348-b1ec696e5237'],
                address: 'Worli, Mumbai',
                location: [19.0176, 72.8172],
            }
        ];

        const savedItems = await this.usedItemModel.insertMany(items);

        const offers = [
            {
                itemId: savedItems[0]._id,
                userId: user2,
                offeredPrice: 42000,
                status: 'pending'
            },
            {
                itemId: savedItems[1]._id,
                userId: user2,
                offeredPrice: 620000,
                status: 'pending'
            }
        ];

        await this.usedOfferModel.insertMany(offers);

        return { message: 'Seed data created successfully', count: savedItems.length };
    }
}
