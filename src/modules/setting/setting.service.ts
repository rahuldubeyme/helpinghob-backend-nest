import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { AdminSetting, AdminSettingDocument } from '@mongodb/schemas/admin-settings.schema';
import { Booking, BookingDocument } from '@mongodb/schemas/booking.schema';
import { UpdateProfileDto } from './dto/profile.dto';
import { AddBiomatricDto, ChangePasswordDto, UpdateAdminSettingDto } from './dto/setting-update.dto';
import { comparePassword, hashPassword, sanitizeUser } from '@common/utils';

@Injectable()
export class SettingService {
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(AdminSetting.name) private adminSettingModel: Model<AdminSettingDocument>,
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    ) { }

    async getProfile(userId: string, role: string) {
        const user = await this.userModel.findById(userId).lean();
        if (!user) throw new NotFoundException('Profile not found');
        return sanitizeUser(user);
    }

    async updateProfile(userId: string, role: string, dto: UpdateProfileDto) {
        const update: any = {};
        const allowed = ['fullName', 'avatar', 'bio', 'gender', 'dob', 'email', 'countryCode', 'mobile'];
        for (const key of allowed) {
            if ((dto as any)[key] !== undefined) update[key] = (dto as any)[key];
        }
        if ((dto as any).password) update.password = await hashPassword((dto as any).password);
        const user = await this.userModel.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean();
        if (!user) throw new NotFoundException('Profile not found');
        return sanitizeUser(user);
    }

    async getAdminSettings() {
        let settings = await this.adminSettingModel.findOne({ isDeleted: false }).lean();
        if (!settings){
            // settings = await this.adminSettingModel.create({});
        } 
        return settings;
    }

    async updateAdminSettings(dto: UpdateAdminSettingDto) {
        let settings = await this.adminSettingModel.findOne({ isDeleted: false });
        if (!settings) settings = await this.adminSettingModel.create({});
        Object.assign(settings, dto);
        return settings.save();
    }

    async deleteAccount(userId: string, role: string) {
        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('Account not found');
        await this.userModel.findByIdAndUpdate(userId, { $set: { isDeleted: true, isSuspended: true } });
        return { success: true, message: 'Account deleted successfully' };
    }

    async updatePassword(id: string, role: string, dto: ChangePasswordDto) {
        const user = await this.userModel.findById(id);
        if (!user) throw new NotFoundException('User not found');
        const valid = await comparePassword(dto.oldPassword, user.password);
        if (!valid) throw new ConflictException('Old password is incorrect');
        user.password = await hashPassword(dto.password);
        await user.save();
        return { message: 'Password updated successfully' };
    }

    async enableBiomatric(user: any, dto: AddBiomatricDto) {
        const found = await this.userModel.findById(user.id);
        if (!found) throw new NotFoundException('User not found');
        Object.assign(found, dto);
        return found.save();
    }
}
