import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '@mongodb/schemas/order.schema';
import { Product, ProductDocument } from '@mongodb/schemas/product.schema';
import { Review, ReviewDocument } from '@mongodb/schemas/review.schema';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { Merchant, MerchantDocument } from '@mongodb/schemas/merchant.schema';

@Injectable()
export class HardwareShopService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
    ) { }

    async home(userId: string) {
        const shops = await this.merchantModel.find({ type: 'hardware', isDeleted: false, isActive: true }).lean();
        return { shops };
    }
    async shopDetails(shopId: string) {
        const shop = await this.merchantModel.findById(shopId).lean();
        if (!shop) throw new NotFoundException('Shop not found');
        return shop;
    }
    async shopCatalog(shopId: string, search?: string) {
        const q: any = { merchantId: new Types.ObjectId(shopId), isDeleted: false };
        if (search) q.name = new RegExp(search, 'i');
        return this.productModel.find(q).lean();
    }
    async productList(shopId: string, categoryId?: string, search?: string) {
        const q: any = { merchantId: new Types.ObjectId(shopId), isDeleted: false };
        if (categoryId) q.categoryId = new Types.ObjectId(categoryId);
        if (search) q.name = new RegExp(search, 'i');
        return this.productModel.find(q).lean();
    }
    async productDetails(productId: string) {
        const p = await this.productModel.findById(productId).lean();
        if (!p) throw new NotFoundException('Product not found');
        return p;
    }
    async addToCart(userId: string, productId: string, shopId: string, quantity: number) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        const cart = user.cart || [];
        const idx = cart.findIndex((i: any) => i.productId?.toString() === productId);
        if (idx >= 0) cart[idx].quantity = quantity;
        else cart.push({ productId: new Types.ObjectId(productId), shopId: new Types.ObjectId(shopId), quantity });
        user.cart = cart;
        await user.save();
        return user.cart;
    }
    async updateCart(userId: string, productId: string, shopId: string, quantity: number) {
        return this.addToCart(userId, productId, shopId, quantity);
    }
    async cartDetails(userId: string) {
        const user = await this.userModel.findById(userId).populate('cart.productId').lean();
        return user?.cart ?? [];
    }
    async clearCart(userId: string) {
        await this.userModel.findByIdAndUpdate(userId, { $set: { cart: [] } });
        return {};
    }
    async createOrder(userId: string, dto: any) {
        const cart = (await this.userModel.findById(userId).lean())?.cart ?? [];
        if (!cart.length) throw new BadRequestException('Cart is empty');
        const order = await this.orderModel.create({
            userId: new Types.ObjectId(userId),
            merchantId: new Types.ObjectId(dto.shopId),
            items: cart,
            addressId: new Types.ObjectId(dto.addressId),
            couponCode: dto.couponCode,
            instructions: dto.instructions,
            status: 'PENDING',
            type: 'hardware',
        });
        await this.userModel.findByIdAndUpdate(userId, { $set: { cart: [] } });
        return order;
    }
    async pay(userId: string, dto: any) {
        const order = await this.orderModel.findOneAndUpdate(
            { _id: dto.orderId, userId: new Types.ObjectId(userId) },
            { $set: { paymentStatus: 'paid', paymentMethod: dto.paymentMethod } },
            { new: true },
        );
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
    async orders(userId: string, q: any) {
        const filter: any = { userId: new Types.ObjectId(userId), type: 'hardware', isDeleted: false };
        if (q.status) filter.status = q.status;
        return this.orderModel.find(filter).sort({ createdAt: -1 }).lean();
    }
    async orderDetails(userId: string, orderId: string) {
        const order = await this.orderModel.findOne({ _id: orderId, userId: new Types.ObjectId(userId) }).lean();
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
    async raiseDispute(userId: string, dto: any) {
        const order = await this.orderModel.findOneAndUpdate(
            { _id: dto.orderId, userId: new Types.ObjectId(userId) },
            { $set: { dispute: { reason: dto.reason, description: dto.description, raisedAt: new Date() } } },
            { new: true },
        );
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }
    async ratingReview(userId: string, dto: any) {
        return this.reviewModel.create({
            userId: new Types.ObjectId(userId),
            merchantId: new Types.ObjectId(dto.shopId),
            orderId: new Types.ObjectId(dto.orderId),
            rating: dto.rating,
            review: dto.review,
        });
    }
    async getReviews(shopId: string) {
        return this.reviewModel.find({ merchantId: new Types.ObjectId(shopId), isDeleted: false }).sort({ createdAt: -1 }).lean();
    }
}
