import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { Product, ProductDocument } from '@mongodb/schemas/product.schema';
import { Order, OrderDocument } from '@mongodb/schemas/order.schema';
import { Review, ReviewDocument } from '@mongodb/schemas/review.schema';

@Injectable()
export class DairyDropService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(User.name) private merchantModel: Model<UserDocument>,
    ) { }

    /** POST /dairy-drop/create-shop-profile */
    async createShopProfile(userId: string, dto: any) {
        const existing = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (existing) throw new NotFoundException('Shop profile already exists, use PUT to update');
        return this.merchantModel.create({ ...dto, userId: new Types.ObjectId(userId), type: 'dairy', isActive: true });
    }

    /** PUT /dairy-drop/create-shop-profile */
    async updateShopProfile(userId: string, dto: any) {
        return this.merchantModel.findOneAndUpdate(
            { userId: new Types.ObjectId(userId), type: 'dairy' },
            { $set: dto },
            { new: true },
        );
    }

    /** GET /dairy-drop/create-shop-profile */
    async getShopProfile(userId: string) {
        return this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' }).lean();
    }

    /** POST /dairy-drop/create-profile (owner personal profile) */
    async createOwnerProfile(userId: string, dto: any) {
        return this.userModel.findByIdAndUpdate(userId, { $set: dto }, { new: true });
    }

    /** PUT /dairy-drop/create-profile */
    async updateOwnerProfile(userId: string, dto: any) {
        return this.userModel.findByIdAndUpdate(userId, { $set: dto }, { new: true });
    }

    /** GET /dairy-drop/common-product-list — global catalogue to pick products from */
    async getCommonProductList(query: any) {
        const q: any = { isCommon: true, isDeleted: false };
        if (query.search) q.name = new RegExp(query.search, 'i');
        const page = query.page ?? 1;
        return this.productModel
            .find(q)
            .skip((page - 1) * 20)
            .limit(20)
            .lean();
    }

    /** POST /dairy-drop/common-product-list — bulk-select products into provider's shop */
    async selectCommonProducts(userId: string, productIds: string[]) {
        const merchant = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (!merchant) throw new NotFoundException('Shop profile not found');
        for (const pid of productIds) {
            const src = await this.productModel.findById(pid).lean();
            if (!src) continue;
            const exists = await this.productModel.findOne({ merchantId: merchant._id, sourceProductId: new Types.ObjectId(pid) });
            if (!exists) {
                await this.productModel.create({ ...(src as any), _id: undefined, merchantId: merchant._id, sourceProductId: pid });
            }
        }
        return {};
    }

    /** POST /dairy-drop/add-product */
    async addProduct(userId: string, dto: any) {
        const merchant = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (!merchant) throw new NotFoundException('Shop profile not found');
        return this.productModel.create({ ...dto, merchantId: merchant._id });
    }

    /** PUT /dairy-drop/update-product */
    async updateProduct(userId: string, dto: any) {
        const { productId, ...rest } = dto;
        return this.productModel.findByIdAndUpdate(productId, { $set: rest }, { new: true });
    }

    /** DELETE /dairy-drop/update-product?productId */
    async deleteProduct(productId: string) {
        await this.productModel.findByIdAndUpdate(productId, { $set: { isDeleted: true } });
        return {};
    }

    /** GET /dairy-drop/product-list */
    async getProductList(userId: string, query: any) {
        const merchant = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (!merchant) return [];
        const q: any = { merchantId: merchant._id, isDeleted: false };
        if (query.search) q.name = new RegExp(query.search, 'i');
        const page = query.page ?? 1;
        return this.productModel.find(q).skip((page - 1) * 20).limit(20).lean();
    }

    /** GET /dairy-drop/product-details?productId */
    async getProductDetails(productId: string) {
        const p = await this.productModel.findById(productId).lean();
        if (!p) throw new NotFoundException('Product not found');
        return p;
    }

    /** GET /dairy-drop/inventory */
    async getInventory(userId: string, query: any) {
        const merchant = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (!merchant) return [];
        return this.productModel.find({ merchantId: merchant._id, isDeleted: false }, { name: 1, unit: 1, quantity: 1 }).lean();
    }

    /** POST /dairy-drop/inventory */
    async updateInventory(userId: string, items: { productId: string; quantity: number }[]) {
        for (const item of items) {
            await this.productModel.findByIdAndUpdate(item.productId, { $set: { quantity: item.quantity } });
        }
        return {};
    }

    /** GET /dairy-drop/orders */
    async getOrders(userId: string, query: any) {
        const merchant = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (!merchant) return [];
        const filter: any = { merchantId: merchant._id, isDeleted: false };
        if (query.status) filter.status = query.status;
        const page = query.page ?? 1;
        return this.orderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * 20).limit(20).lean();
    }

    /** POST /dairy-drop/orders/status */
    async updateOrderStatus(userId: string, dto: any) {
        return this.orderModel.findByIdAndUpdate(dto.orderId, { $set: { status: dto.status } }, { new: true });
    }

    /** GET /dairy-drop/earnings */
    async getEarnings(userId: string, query: any) {
        const merchant = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (!merchant) return { total: 0 };
        const matchFilter: any = { merchantId: merchant._id, paymentStatus: 'paid', isDeleted: false };
        if (query.startDate) matchFilter.createdAt = { $gte: new Date(query.startDate) };
        if (query.endDate) matchFilter.createdAt = { ...matchFilter.createdAt, $lte: new Date(query.endDate) };
        const result = await this.orderModel.aggregate([
            { $match: matchFilter },
            { $group: { _id: null, totalEarnings: { $sum: '$amount' }, total: { $sum: 1 } } },
        ]);
        return result[0] ?? { totalEarnings: 0, total: 0 };
    }

    /** GET /dairy-drop/ratings */
    async getRatings(userId: string, query: any) {
        const merchant = await this.merchantModel.findOne({ userId: new Types.ObjectId(userId), type: 'dairy' });
        if (!merchant) return [];
        const page = query.page ?? 1;
        return this.reviewModel.find({ merchantId: merchant._id, isDeleted: false })
            .sort({ createdAt: -1 }).skip((page - 1) * 10).limit(10).lean();
    }
}
