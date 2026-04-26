import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from '@mongodb/schemas/order.schema';
import { Product, ProductDocument } from '@mongodb/schemas/product.schema';
import { Review, ReviewDocument } from '@mongodb/schemas/review.schema';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { Merchant, MerchantDocument } from '@mongodb/schemas/merchant.schema';

@Injectable()
export class GroceryService {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
    ) { }

    // GET /grocery/home — nearby grocery shops
    async home(userId: string) {
        const user = await this.userModel.findById(userId).lean();
        const shops = await this.merchantModel.find({
            type: 'grocery',
            isDeleted: false,
            isSuspended: false,
            isActive: true,
        }).lean();
        return { shops };
    }

    // GET /grocery/shop-details
    async shopDetails(shopId: string) {
        const shop = await this.merchantModel.findById(shopId).lean();
        if (!shop) throw new NotFoundException('Shop not found');
        return shop;
    }

    // GET /grocery/shop-catalog
    async shopCatalog(shopId: string, search?: string) {
        const query: any = { merchantId: new Types.ObjectId(shopId), isDeleted: false };
        if (search) query.name = new RegExp(search, 'i');
        return this.productModel.find(query).lean();
    }

    // GET /grocery/product-list
    async productList(shopId: string, categoryId?: string, search?: string) {
        const query: any = { merchantId: new Types.ObjectId(shopId), isDeleted: false };
        if (categoryId) query.categoryId = new Types.ObjectId(categoryId);
        if (search) query.name = new RegExp(search, 'i');
        return this.productModel.find(query).lean();
    }

    // GET /grocery/product-details
    async productDetails(productId: string) {
        const product = await this.productModel.findById(productId).lean();
        if (!product) throw new NotFoundException('Product not found');
        return product;
    }

    // POST /grocery/add-to-cart
    async addToCart(userId: string, productId: string, shopId: string, quantity: number) {
        // const user = await this.userModel.findById(userId);
        // if (!user) throw new NotFoundException('User not found');
        // const cart = user.cart || [];
        // const idx = cart.findIndex((i: any) => i.productId?.toString() === productId);
        // if (idx >= 0) cart[idx].quantity = quantity;
        // else cart.push({ productId: new Types.ObjectId(productId), shopId: new Types.ObjectId(shopId), quantity });
        // user.cart = cart;
        // await user.save();
        // return user.cart;
    }

    // PUT /grocery/add-to-cart
    async updateCart(userId: string, productId: string, shopId: string, quantity: number) {
        return this.addToCart(userId, productId, shopId, quantity);
    }

    // GET /grocery/cart-details
    async cartDetails(userId: string) {
        // const user = await this.userModel.findById(userId).populate('cart.productId').lean();
        // return user?.cart ?? [];
    }

    // DELETE /grocery/cart-details
    async clearCart(userId: string) {
        await this.userModel.findByIdAndUpdate(userId, { $set: { cart: [] } });
        return {};
    }

    // POST /grocery/create-order
    async createOrder(userId: string, dto: any) {
        const { shopId, addressId, couponCode, instructions } = dto;
        // const cart = (await this.userModel.findById(userId).lean())?.cart ?? [];
        // if (!cart.length) throw new BadRequestException('Cart is empty');
        // const order = await this.orderModel.create({
        //     userId: new Types.ObjectId(userId),
        //     merchantId: new Types.ObjectId(shopId),
        //     items: cart,
        //     addressId: new Types.ObjectId(addressId),
        //     couponCode,
        //     instructions,
        //     status: 'PENDING',
        //     type: 'grocery',
        // });
        await this.userModel.findByIdAndUpdate(userId, { $set: { cart: [] } });
       // return order;
    }

    // POST /grocery/pay
    async pay(userId: string, dto: any) {
        const order = await this.orderModel.findOneAndUpdate(
            { _id: dto.orderId, userId: new Types.ObjectId(userId) },
            { $set: { paymentStatus: 'paid', paymentMethod: dto.paymentMethod } },
            { new: true },
        );
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    // GET /grocery/orders
    async orders(userId: string, query: any) {
        const filter: any = { userId: new Types.ObjectId(userId), type: 'grocery', isDeleted: false };
        if (query.status) filter.status = query.status;
        return this.orderModel.find(filter).sort({ createdAt: -1 }).lean();
    }

    // GET /grocery/order-details
    async orderDetails(userId: string, orderId: string) {
        const order = await this.orderModel.findOne({ _id: orderId, userId: new Types.ObjectId(userId) }).lean();
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    // POST /grocery/raise-dispute
    async raiseDispute(userId: string, dto: any) {
        const order = await this.orderModel.findOneAndUpdate(
            { _id: dto.orderId, userId: new Types.ObjectId(userId) },
            { $set: { dispute: { reason: dto.reason, description: dto.description, raisedAt: new Date() } } },
            { new: true },
        );
        if (!order) throw new NotFoundException('Order not found');
        return order;
    }

    // POST /grocery/rating-review
    async ratingReview(userId: string, dto: any) {
        const review = await this.reviewModel.create({
            userId: new Types.ObjectId(userId),
            merchantId: new Types.ObjectId(dto.shopId),
            orderId: new Types.ObjectId(dto.orderId),
            rating: dto.rating,
            review: dto.review,
        });
        return review;
    }

    // GET /grocery/rating-review
    async getReviews(shopId: string) {
        return this.reviewModel.find({ merchantId: new Types.ObjectId(shopId), isDeleted: false })
            .sort({ createdAt: -1 }).lean();
    }
}
