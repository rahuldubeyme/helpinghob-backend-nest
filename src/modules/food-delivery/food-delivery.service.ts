import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '@mongodb/schemas/service.schema';
import { ServiceCategory, ServiceCategoryDocument } from '@mongodb/schemas/service-category.schema';
import { SubCategory, SubCategoryDocument } from '@mongodb/schemas/sub-category.schema';
import { Merchant, MerchantDocument } from '@mongodb/schemas/merchant.schema';
import { Order, OrderDocument } from '@mongodb/schemas/order.schema';

@Injectable()
export class FoodDeliveryService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(ServiceCategory.name) private categoryModel: Model<ServiceCategoryDocument>,
        @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategoryDocument>,
        @InjectModel(Merchant.name) private merchantModel: Model<MerchantDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    ) { }

    async getHomeData() {
        return { success: true, message: 'Food home data fetched' };
    }

    async getRestaurantsList(filters: any) {
        const { categoryId, search, page = 1, perPage = 10 } = filters;
        const filterQuery: any = { isDeleted: false, status: 'approve' };

        if (categoryId) {
            filterQuery.categoryId = new Types.ObjectId(categoryId);
        }

        if (search) {
            filterQuery.title = new RegExp(search, 'i');
        }

        const skip = (page - 1) * perPage;
        const restaurants = await this.serviceModel.find(filterQuery)
            .populate('merchantId')
            .skip(skip)
            .limit(perPage)
            .lean();

        return restaurants;
    }

    async getMenuByRestaurant(restaurantId: string) {
        if (!Types.ObjectId.isValid(restaurantId)) {
            throw new BadRequestException('Invalid Restaurant ID');
        }

        const menu = await this.serviceModel.find({
            merchantId: new Types.ObjectId(restaurantId),
            isDeleted: false,
        }).populate('subCategoryId').lean();

        return menu;
    }

    async placeOrder(userId: string, body: any) {
        const { items, deliveryAddress, deliveryLocation, paymentMode } = body;

        let subTotal = 0;
        const productDetails: any[] = [];

        for (const item of items) {
            const product = await this.serviceModel.findOne({
                _id: item.productId,
                isActive: true,
                isDeleted: false
            });
            if (!product) throw new NotFoundException(`Product ${item.productId} not found or unavailable`);

            const itemPrice = product.price || 0;
            subTotal += itemPrice * item.quantity;
            productDetails.push({
                productId: product._id,
                title: product.title,
                price: itemPrice,
                quantity: item.quantity
            });
        }

        const order = new this.orderModel({
            orderID: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            userId: new Types.ObjectId(userId),
            deliveryAddress,
            deliveryLocation: deliveryLocation || [0, 0],
            price: subTotal,
            grandTotal: subTotal + 20, // 20 INR delivery fee
            paymentMode: paymentMode || 'CASH',
            productDetails,
            status: 'pending',
            orderActivity: [{ status: 'pending', timestamp: new Date(), meta: { message: 'Order placed' } }]
        });

        return await order.save();
    }

    async updateOrderStatus(orderId: string, newStatus: string) {
        const order = await this.orderModel.findById(orderId);
        if (!order) throw new NotFoundException('Order not found');

        const allowedTransitions: any = {
            'pending': ['preparing', 'cancelled'],
            'preparing': ['dispatched', 'cancelled'],
            'dispatched': ['delivered', 'cancelled'],
            'delivered': [],
            'cancelled': []
        };

        if (!allowedTransitions[order.status].includes(newStatus)) {
            throw new BadRequestException(`Cannot transition order from ${order.status} to ${newStatus}`);
        }

        order.status = newStatus;
        order.orderActivity.push({
            status: newStatus,
            timestamp: new Date(),
            meta: { message: `Order status updated to ${newStatus}` }
        });

        return await order.save();
    }
}
