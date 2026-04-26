import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '@mongodb/schemas/service.schema';
import { ServiceCategory, ServiceCategoryDocument } from '@mongodb/schemas/service-category.schema';
import { SubCategory, SubCategoryDocument } from '@mongodb/schemas/sub-category.schema';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { OndemandBooking, OndemandBookingDocument } from '@mongodb/schemas/ondemand-booking.schema';
import { Review, ReviewDocument } from '@mongodb/schemas/review.schema';

@Injectable()
export class OndemandService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(ServiceCategory.name) private categoryModel: Model<ServiceCategoryDocument>,
        @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategoryDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(OndemandBooking.name) private bookingModel: Model<OndemandBookingDocument>,
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    ) { }

    // ── User Endpoints ──────────────────────────────────────────────────────────

    async getHomeData(): Promise<any> {
        // Top categories and featured providers
        const [categories, providers] = await Promise.all([
            this.categoryModel.find({ isDeleted: false, isSuspended: false }).limit(10).select('title icon').lean(),
            this.userModel.find({ roleName: 'provider', isDeleted: false, accountStatus: 'approved' })
                .sort({ rating: -1, experience: -1 })
                .limit(10)
                .select('fullName avatar rating experience startingPrice categoryName availability accountStatus')
                .lean(),
        ]);

        const topProviders = providers.map(p => {
            let prefix = 'SENIOR';
            if (p.experience >= 8) prefix = 'MASTER';
            else if (p.experience >= 4) prefix = 'EXPERT';

            return {
                ...p,
                expertTitle: `${prefix} ${'PROVIDER'}`.toUpperCase(),
                isVerified: p.accountStatus === 'approved'
            };
        });

        return { categories, topProviders };
    }

    async getServiceProviders(query: any) {
        const { categoryName, search, lat, lng, page = 1, limit = 10 } = query;
        const filter: any = { roleName: 'provider', isDeleted: false, accountStatus: 'approved' };

        if (categoryName) filter.categoryName = categoryName;
        if (search) filter.fullName = new RegExp(search, 'i');

        const skip = (page - 1) * limit;
        const [data, total] = await Promise.all([
            this.userModel.find(filter).skip(skip).limit(limit).lean(),
            this.userModel.countDocuments(filter),
        ]);

        return { data, total, page, limit };
    }

    async getProviderDetails(providerId: string): Promise<any> {
        const providerData = await this.userModel.findById(providerId).lean();
        if (!providerData) throw new NotFoundException('Provider not found');

        const [services, recentReviews, totalReviews, jobsDone] = await Promise.all([
            this.serviceModel.find({ serviceProviderId: new Types.ObjectId(providerId), isDeleted: false })
                .populate('subCategoryId')
                .lean(),
            this.reviewModel.find({ providerId: new Types.ObjectId(providerId), isDeleted: false })
                .sort({ createdAt: -1 })
                .limit(3)
                .populate('userId', 'fullName avatar')
                .lean(),
            this.reviewModel.countDocuments({ providerId: new Types.ObjectId(providerId), isDeleted: false }),
            this.bookingModel.countDocuments({ providerId: new Types.ObjectId(providerId), status: 'completed' })
        ]);

        let prefix = 'SENIOR';
        if (providerData.experience >= 8) prefix = 'MASTER';
        else if (providerData.experience >= 4) prefix = 'EXPERT';

        const provider = {
            ...providerData,
            expertTitle: `${prefix} ${'PROVIDER'}`.toUpperCase(),
            isVerified: providerData.accountStatus === 'approved',
            jobsDone,
            totalReviews
        };

        return { provider, services, recentReviews, totalReviews };
    }

    async getProviderReviews(providerId: string, query: any): Promise<any> {
        const { page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;

        const [reviews, total] = await Promise.all([
            this.reviewModel.find({ providerId: new Types.ObjectId(providerId), isDeleted: false })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'fullName avatar')
                .lean(),
            this.reviewModel.countDocuments({ providerId: new Types.ObjectId(providerId), isDeleted: false })
        ]);

        return { reviews, total, page, limit };
    }
}
