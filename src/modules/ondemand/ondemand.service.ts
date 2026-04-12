import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '@mongodb/schemas/service.schema';
import { ServiceCategory, ServiceCategoryDocument } from '@mongodb/schemas/service-category.schema';
import { SubCategory, SubCategoryDocument } from '@mongodb/schemas/sub-category.schema';
import { User, UserDocument } from '@mongodb/schemas/user.schema';

@Injectable()
export class OndemandService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(ServiceCategory.name) private categoryModel: Model<ServiceCategoryDocument>,
        @InjectModel(SubCategory.name) private subCategoryModel: Model<SubCategoryDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    // ── User Endpoints ──────────────────────────────────────────────────────────

    async getHomeData() {
        // Top categories and featured providers
        const [categories, topProviders] = await Promise.all([
            this.categoryModel.find({ isDeleted: false }).limit(8).lean(),
            this.userModel.find({ role: 2, roleName: 'provider', isDeleted: false, accountStatus: 'approved' })
                .sort({ rating: -1, experience: -1 })
                .limit(5)
                .lean(),
        ]);
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

    async getProviderDetails(providerId: string) {
        const provider = await this.userModel.findById(providerId).lean();
        if (!provider) throw new NotFoundException('Provider not found');

        const services = await this.serviceModel.find({ serviceProviderId: new Types.ObjectId(providerId), isDeleted: false })
            .populate('subCategoryId')
            .lean();

        return { provider, services };
    }
}
