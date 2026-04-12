import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { Review, ReviewDocument } from '@mongodb/schemas/review.schema';
import { SubCategory, SubCategoryDocument } from '@mongodb/schemas/sub-category.schema';
import { Banner, BannerDocument } from '@mongodb/schemas/banner.schema';
import { Notification, NotificationDocument } from '@mongodb/schemas/notification.schema';
import { Booking, BookingDocument } from '@mongodb/schemas/booking.schema';
import { AdminSetting, AdminSettingDocument } from '@mongodb/schemas/admin-settings.schema';


@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
        @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategoryDocument>,
        @InjectModel(Banner.name) private bannerModel: Model<BannerDocument>,
        @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(AdminSetting.name) private adminSettingModel: Model<AdminSettingDocument>
    ) { }

    // GET /users/profile
    async getProfile(userId: string) {
        const user = await this.userModel.findById(userId).lean();
        if (!user) throw new NotFoundException('User not found');
        const { password, emailOtp, emailToken, ...safe } = user as any;
        return safe;
    }

    // GET /users/driver-profile
    async getProviderProfile(userId: string) {
        const user = await this.userModel.findById(userId).lean();
        if (!user) throw new NotFoundException('User not found');
        return {
            vehicle: (user as any).vehicle,
            availability: (user as any).availability,
            accountStatus: (user as any).accountStatus
        };
    }

    // POST /users/update-profile
    async updateProfile(userId: string, dto: any) {
        const { fullName, avatar, bio, gender, dob } = dto;
        const update: any = {};
        if (fullName) update.fullName = fullName;
        if (avatar) update.avatar = avatar;
        if (bio) update.bio = bio;
        if (gender) update.gender = gender;
        if (dob) update.dob = dob;
        return this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean();
    }

    // GET /users/delete-account
    async deleteAccount(userId: string) {
        const activeBookings = await this.bookingModel.countDocuments({
            $or: [{ userId: new Types.ObjectId(userId) }, { serviceProviderId: new Types.ObjectId(userId) }],
            bookingStatus: { $in: ['PENDING', 'ACCEPT', 'REACHED', 'STARTED'] },
            isDeleted: false,
        });
        if (activeBookings) throw new BadRequestException('You have ongoing active bookings');
        await this.userModel.findByIdAndUpdate(userId, {
            $set: {
                fullName: 'Account deleted', avatar: 'users/user.svg',
                isActive: false, isSuspended: true, isDeleted: true,
            },
        });
        return {};
    }

    // GET /users/category-list
    async getCategoryList() {
        //return this.categoryModel.find({ isDeleted: false }).lean();
    }

    // POST /users/subcategory-list
    async getSubCategoryList(categoryIds: string[], search?: string) {
        const match: any = { $and: [{ isDeleted: false }] };
        if (categoryIds?.length) match.$and.push({ categoryId: { $in: categoryIds.map(id => new Types.ObjectId(id)) } });
        if (search) match.$and.push({ title: new RegExp(search, 'i') });
        return this.subCategoryModel.find(match).lean();
    }

    // GET /users/banner-list
    async getBannerList() {
        return this.bannerModel.find({ isDeleted: false, isActive: true }).lean();
    }

    // PUT /users/update-user-services
    async updateUserServices(userId: string, dto: any) {
        return this.userModel.findByIdAndUpdate(userId, { $set: { services: dto.services, description: dto.description, isPetFriendly: dto.isPetFriendly } }, { new: true });
    }

    // POST /users/add-service-price
    async addServicePrice(userId: string, dto: any) {
        // Service price logic delegated to Service model (uses Service collection)
        return { success: true };
    }

    async updateAvailability(userId: string, availability: string) {
        return this.userModel.findByIdAndUpdate(userId, { $set: { availability } }, { new: true });
    }

    async submitOnboarding(userId: string, dto: any) {
        // Handle onboarding data submission for providers
        return this.userModel.findByIdAndUpdate(userId, { $set: { ...dto, accountStatus: 'pending' } }, { new: true });
    }

    // GET /users/get-address
    async getAddresses(userId: string) {
        const user = await this.userModel.findById(userId, { userAddress: 1 }).lean();
        return (user as any)?.userAddress ?? [];
    }

    // POST /users/add-new-address
    async addAddress(userId: string, dto: any) {
        const { countryId, city, addressTag, address, zipcode, lat, lng, doorNumber, streetName, locality, isPrimary } = dto;
        if (isPrimary) {
            await this.userModel.updateOne({ _id: userId, 'userAddress.isPrimary': true }, { $set: { 'userAddress.$.isPrimary': false } });
        }
        await this.userModel.findByIdAndUpdate(userId, {
            $push: { userAddress: { countryId, city, addressTag, doorNumber, streetName, locality, address, zipcode, location: [lng, lat], isPrimary } },
        });
        return {};
    }

    // POST /users/edit-address
    async updateAddress(userId: string, dto: any) {
        const { addressId, countryId, city, addressTag, address, zipcode, lat, lng, doorNumber, streetName, locality } = dto;
        await this.userModel.updateOne(
            { _id: userId, 'userAddress._id': new Types.ObjectId(addressId) },
            {
                $set: {
                    'userAddress.$.countryId': countryId, 'userAddress.$.city': city,
                    'userAddress.$.doorNumber': doorNumber, 'userAddress.$.streetName': streetName,
                    'userAddress.$.locality': locality, 'userAddress.$.addressTag': addressTag,
                    'userAddress.$.address': address, 'userAddress.$.zipcode': zipcode,
                    'userAddress.$.location': [lng, lat],
                },
            },
        );
        return {};
    }

    // GET /users/delete-address
    async deleteAddress(userId: string, requestId: string) {
        await this.userModel.updateOne(
            { _id: userId, 'userAddress._id': new Types.ObjectId(requestId) },
            { $set: { 'userAddress.$.isDeleted': true } },
        );
        return {};
    }

    // GET /users/notifications
    async notificationList(userId: string) {
        return this.notificationModel.find({ toUserId: new Types.ObjectId(userId), isDeleted: false })
            .sort({ createdAt: -1 }).lean();
    }

    // POST /users/support
    async submitSupport(userId: string, body: any) {
        //return this.supportModel.create({ ...body, userId: new Types.ObjectId(userId) });
    }

    // GET /users/earnings
    async getEarnings(userId: string) {
        return this.bookingModel.aggregate([
            { $match: { serviceProviderId: new Types.ObjectId(userId), bookingStatus: 'COMPLETED', isDeleted: false } },
            { $group: { _id: null, totalEarnings: { $sum: '$amount' }, total: { $sum: 1 } } },
        ]);
    }

    async getDetailedEarnings(userId: string) {
        return this.bookingModel.find({ serviceProviderId: new Types.ObjectId(userId), bookingStatus: 'COMPLETED', isDeleted: false }).sort({ createdAt: -1 }).lean();
    }

    // GET /users/markDefaultAddress
    async setPrimaryAddress(userId: string, addressId: string) {
        await this.userModel.updateOne({ _id: userId, 'userAddress.isPrimary': true }, { $set: { 'userAddress.$.isPrimary': false } });
        await this.userModel.updateOne(
            { _id: userId, 'userAddress._id': new Types.ObjectId(addressId) },
            { $set: { 'userAddress.$.isPrimary': true } },
        );
        return {};
    }

    // PUT /users/updateLocation
    async updateLocation(userId: string, location: number[]) {
        return this.userModel.findByIdAndUpdate(userId, { $set: { location } }, { new: true });
    }

    // PUT /users/updateLanguage
    async updateLanguage(userId: string, language: string) {
        return this.userModel.findByIdAndUpdate(userId, { $set: { 'device.langauge': language } }, { new: true });
    }

    // POST /users/addFavorite
    async addFavorite(userId: string, favoriteUserId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');
        const favs: any[] = (user as any).favorites ?? [];
        const fId = new Types.ObjectId(favoriteUserId);
        const idx = favs.findIndex(f => f.toString() === favoriteUserId);
        if (idx >= 0) favs.splice(idx, 1); // toggle off
        else favs.push(fId);
        await this.userModel.findByIdAndUpdate(userId, { $set: { favorites: favs } });
        return {};
    }

    // GET /users/home-list
    async homeList(params: any) {
        const adminData = await this.adminSettingModel.findOne({});
        const milesMax = params.milesMax ? parseFloat(params.milesMax) : (adminData as any)?.distance || 50;
        const milesMin = 0;
        const limit = parseInt(params.perPage) || 10;
        const skip = (parseInt(params.page) || 1) - 1 * limit;

        const query: any = {
            $and: [
                {
                    role: 2, // Provider
                    isSuspended: false,
                    isDeleted: false,
                    isActive: true,
                    isVerified: true,
                    status: 'Online',
                },
            ],
        };

        if (params.categoryIds?.length) {
            query.$and.push({ categoryId: { $in: params.categoryIds.map(id => new Types.ObjectId(id)) } });
        }

        if (params.subCategoryIds?.length) {
            query.$and.push({ subCategoryId: { $in: params.subCategoryIds.map(id => new Types.ObjectId(id)) } });
        }

        if (params.rating) {
            query.$and.push({ avgRating: { $gte: parseFloat(params.rating) } });
        }

        if (params.isFeatured) {
            query.$and.push({ isFeatured: true });
        }

        const pipeline: any[] = [];

        if (params.lng && params.lat) {
            pipeline.push({
                $geoNear: {
                    near: { type: 'Point', coordinates: [parseFloat(params.lng), parseFloat(params.lat)] },
                    distanceField: 'distance',
                    minDistance: milesMin * 1609.34,
                    maxDistance: milesMax * 1609.34,
                    key: 'location',
                    spherical: true,
                    query: { status: 'Online' },
                },
            });
        }

        pipeline.push({ $match: query });

        // Availability check logic (simplified from legacy)
        if (params.scheduleTime) {
            const bookingTime = new Date(params.scheduleTime);
            const bookingTimestamp = Math.floor(bookingTime.getTime() / 1000);
            const startOfDay = new Date(bookingTime.setHours(0, 0, 0, 0));
            const endOfDay = new Date(bookingTime.setHours(23, 59, 59, 999));

            pipeline.push({
                $lookup: {
                    from: 'slots',
                    let: { spId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$userId', '$$spId'] },
                                        { $gte: ['$slotDate', startOfDay] },
                                        { $lte: ['$slotDate', endOfDay] },
                                    ],
                                },
                            },
                        },
                        { $unwind: '$unavailability' },
                        {
                            $match: {
                                'unavailability.startTime': { $lte: bookingTimestamp },
                                'unavailability.endTime': { $gte: bookingTimestamp },
                            },
                        },
                    ],
                    as: 'conflicts',
                },
            });
            pipeline.push({ $match: { conflicts: { $size: 0 } } });
        }

        pipeline.push(
            {
                $lookup: {
                    from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'category',
                },
            },
            { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'services',
                    let: { catId: '$category._id', spId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$categoryId', '$$catId'] },
                                        { $eq: ['$serviceProviderId', '$$spId'] },
                                        { $eq: ['$isDeleted', false] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'services',
                },
            },
        );

        pipeline.push({
            $project: {
                _id: 1, fullName: 1, avatar: 1, location: 1, avgRating: 1, city: 1,
                distance: { $multiply: [{ $ifNull: ['$distance', 0] }, 0.00062137] },
                category: { _id: 1, title: 1 },
                minPrice: { $min: '$services.price' },
            },
        });

        pipeline.push({ $sort: { avgRating: -1 } });
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        return this.userModel.aggregate(pipeline);
    }
}
