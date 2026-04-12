import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { Booking, BookingDocument } from '@mongodb/schemas/booking.schema';
import { Order, OrderDocument } from '@mongodb/schemas/order.schema';
import { Review, ReviewDocument } from '@mongodb/schemas/review.schema';
import { SubCategory, SubCategoryDocument } from '@mongodb/schemas/sub-category.schema';
import { Banner, BannerDocument } from '@mongodb/schemas/banner.schema';
import { Coupon, CouponDocument } from '@mongodb/schemas/coupon.schema';

/**
 * Shared service used by all vertical modules (food-delivery, ondemand, local-deals, transport).
 * Each vertical passes its own identifier so data can be scoped appropriately.
 */
@Injectable()
export class VerticalBookingService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategoryDocument>,
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
        @InjectModel(Coupon.name) private couponModel: Model<CouponDocument>,
    ) { }

    async getCategoryList(vertical: string) {
        return this.subCategoryModel.find({ isDeleted: false }).lean();
    }

    async getSubCategoryList(vertical: string, categoryIds?: string[], search?: string) {
        const match: any = { isDeleted: false };
        if (categoryIds?.length) match.categoryId = { $in: categoryIds.map(id => new Types.ObjectId(id)) };
        if (search) match.title = new RegExp(search, 'i');
        return this.subCategoryModel.find(match).lean();
    }

    async getBannerList(vertical: string) {
        return this.bannerModel.find({ isDeleted: false, isActive: true }).lean();
    }

    async homeList(vertical: string, dto: any) {
        return this.userModel.find({ role: 2, isDeleted: false, isSuspended: false }).limit(20).lean();
    }

    async bookingList(userId: string, vertical: string, dto: any) {
        return this.bookingModel.find({ userId: new Types.ObjectId(userId), isDeleted: false })
            .sort({ createdAt: -1 }).lean();
    }

    async bookingDetails(userId: string, bookingId: string) {
        const booking = await this.bookingModel.findById(bookingId).lean();
        if (!booking) throw new NotFoundException('Booking not found');
        return booking;
    }

    async createBooking(userId: string, vertical: string, dto: any) {
        return this.bookingModel.create({ ...dto, userId: new Types.ObjectId(userId) });
    }

    async cancelBooking(userId: string, bookingId: string, reason: string) {
        return this.bookingModel.findByIdAndUpdate(bookingId,
            { $set: { status: 'cancelled', cancellationReason: reason } }, { new: true });
    }

    async pay(userId: string, dto: any) {
        return this.bookingModel.findByIdAndUpdate(dto.bookingId,
            { $set: { paymentStatus: 'paid', paymentMethod: dto.method } }, { new: true });
    }

    async paymentSuccess(paymentIntentId: string) {
        return { success: true, paymentIntentId };
    }

    async receiveBooking(userId: string, dto: any) {
        return this.bookingModel.findByIdAndUpdate(dto.bookingId,
            { $set: { providerId: new Types.ObjectId(userId) } }, { new: true });
    }

    async bookingAction(userId: string, dto: any) {
        return this.bookingModel.findByIdAndUpdate(dto.bookingId,
            { $set: { status: dto.action } }, { new: true });
    }

    async bookingStatus(userId: string, dto: any) {
        return this.bookingModel.findByIdAndUpdate(dto.bookingId,
            { $set: { status: dto.status } }, { new: true });
    }

    async rateBooking(userId: string, dto: any) {
        return this.reviewModel.create({ ...dto, userId: new Types.ObjectId(userId) });
    }

    async addAdditionalServices(userId: string, dto: any) {
        return { success: true };
    }

    async getAdditionalServices(bookingId: string) {
        return [];
    }

    async deleteService(dto: any) {
        return { success: true };
    }

    async getCoupons(vertical: string) {
        return this.couponModel.find({ isDeleted: false, isSuspended: false }).lean();
    }

    async applyCoupon(userId: string, vertical: string, dto: any) {
        const coupon = await this.couponModel.findOne({ code: dto.code, isDeleted: false });
        if (!coupon) throw new NotFoundException('Invalid coupon code');
        return { discount: coupon.value, type: coupon.type };
    }

    // Transport / Pick-n-drop specific
    async vehiclePricing(dto: any) {
        return { vehicles: [] };
    }

    async findDriverByVehicle(dto: any) {
        return this.userModel.find({ role: 4, isDeleted: false }).limit(10).lean();
    }

    async bookRide(userId: string, vertical: string, dto: any) {
        return this.createBooking(userId, vertical, dto);
    }

    async cancelRide(userId: string, dto: any) {
        return this.cancelBooking(userId, dto.bookingId || dto.rideId, dto.reason);
    }
}
