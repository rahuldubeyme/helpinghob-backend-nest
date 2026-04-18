import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AdminSetting, AdminSettingDocument } from '@mongodb/schemas/admin-settings.schema';
import { Faq, FaqDocument } from '@mongodb/schemas/faq.schema';
import { Banner, BannerDocument } from '@mongodb/schemas/banner.schema';
import { Notification, NotificationDocument } from '@mongodb/schemas/notification.schema';
import { StaticPages, StaticPagesDocument } from '@mongodb/schemas/static-pages.schema';
import { MasterService, MasterServiceDocument } from '@mongodb/schemas/master-service.schema';
import { Category, CategoryDocument } from '@mongodb/schemas/category.schema';
import { SubCategory, SubCategoryDocument } from '@mongodb/schemas/sub-category.schema';

@Injectable()
export class ResourcesService {
  constructor(
    @InjectModel(AdminSetting.name) private readonly adminSettingModel: Model<AdminSettingDocument>,
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
    @InjectModel(Banner.name) private readonly bannerModel: Model<BannerDocument>,
    @InjectModel(Notification.name) private readonly notificationModel: Model<NotificationDocument>,
    @InjectModel(StaticPages.name) private readonly staticPagesModel: Model<StaticPagesDocument>,
    @InjectModel(MasterService.name) private readonly masterServiceModel: Model<MasterServiceDocument>,
    @InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>,
    @InjectModel(SubCategory.name) private readonly subCategoryModel: Model<SubCategoryDocument>,
  ) { }

  async getMasterServiceList() {
    const all = await this.masterServiceModel.find({ isDeleted: false }).lean();
    return {
      ourService: all.filter((i: any) => i.isActive),
      upcomingService: all.filter((i: any) => !i.isActive),
    };
  }

  async getActiveBanners(search?: string) {
    const q: any = { isDeleted: false };
    if (search) q.$or = [{ title: new RegExp(search, 'i') }];
    let banner = await this.bannerModel.find(q).sort({ createdAt: -1 }).lean();
    console.log('banner:::', banner);
    return banner;
  }

  async getCategoryList(masterServiceId: string, search?: string) {
    const q: any = { isDeleted: false, masterServiceId: new Types.ObjectId(masterServiceId) };
    if (search) q.title = new RegExp(search, 'i');
    return this.categoryModel.find(q).lean();
  }

  async getSubCategoryList(categoryIds?: string[], search?: string) {
    const match: any = { isDeleted: false };
    if (categoryIds?.length) match.categoryId = { $in: categoryIds.map(id => new Types.ObjectId(id)) };
    if (search) match.title = new RegExp(search, 'i');
    return this.subCategoryModel.find(match).lean();
  }

  async getUserNotifications(userId: string) {
    return this.notificationModel.find({ toUserId: new Types.ObjectId(userId), isDeleted: false })
      .sort({ createdAt: -1 }).lean();
  }

  async getStaticPage(slug: string) {
    const page = await this.staticPagesModel.findOne({ slug }).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findAllfaq() {
    return this.faqModel.find({ isDeleted: false }).sort({ createdAt: -1 }).exec();
  }

  async S3PreUploadUrl(dto: any) {
    return {
      urls: dto.files?.map((f: any) => ({
        fileName: f.fileName,
        url: `https://helpinghob-uploads.s3.amazonaws.com/${f.fileName}?token=dummy`,
        fields: { key: f.fileName },
      })) || [],
    };
  }

  async saveContactInquiry(body: any, userId?: string) {
    return { success: true, message: 'Contact inquiry received', data: body };
  }

  async createCategory(dto: any) { return dto; }
  async findAllCategory() { return []; }
  async findOneCategory(id: string) { return null; }
  async updateCategory(id: string, dto: any) { return dto; }


}
