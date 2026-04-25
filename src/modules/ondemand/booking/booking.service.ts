import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Service, ServiceDocument } from '@mongodb/schemas/service.schema';
import { User, UserDocument } from '@mongodb/schemas/user.schema';
import { OndemandBooking, OndemandBookingDocument } from '@mongodb/schemas/ondemand-booking.schema';
import { Earning, EarningDocument } from '@mongodb/schemas/earning.schema';
import { generateOtp } from '@common/utils';
import { BookingStatus, isValidTransition } from './dto/update-booking-status.dto';

@Injectable()
export class OndemandBookingService {
    constructor(
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
        @InjectModel(OndemandBooking.name) private bookingModel: Model<OndemandBookingDocument>,
        @InjectModel(Earning.name) private earningModel: Model<EarningDocument>,
    ) { }

    async createBooking(userId: string, dto: any): Promise<any> {
        const { providerId, serviceId, scheduledAt, bookingType, materialIncluded } = dto;
        const service = await this.serviceModel.findById(serviceId);
        if (!service) throw new NotFoundException('Service not found');

        const otp = generateOtp();
        const booking = await this.bookingModel.create({
            userId: new Types.ObjectId(userId),
            providerId: new Types.ObjectId(providerId),
            serviceId: new Types.ObjectId(serviceId),
            subCategoryId: service.subCategoryId,
            amount: service.price,
            scheduledAt,
            bookingType,
            materialIncluded,
            otp,
            status: 'pending'
        });
        return booking;
    }

    async getMyBookings(providerId: string, status?: string): Promise<any> {
        const filter: any = { providerId: new Types.ObjectId(providerId), isDeleted: false };
        if (status) filter.status = status;
        return this.bookingModel.find(filter).populate('userId').sort({ createdAt: -1 }).lean();
    }

    async updateBookingStatus(providerId: string, bookingId: string, status: BookingStatus): Promise<any> {
        const booking = await this.bookingModel.findOne({
            _id: new Types.ObjectId(bookingId),
            providerId: new Types.ObjectId(providerId),
            isDeleted: false,
        });
        if (!booking) throw new NotFoundException('Booking not found');

        if (!isValidTransition(booking.status, status)) {
            throw new BadRequestException(
                `Cannot transition from '${booking.status}' to '${status}'`,
            );
        }

        booking.status = status;
        if (status === BookingStatus.ON_THE_WAY) booking.onTheWayAt = new Date();
        if (status === BookingStatus.REACHED) booking.reachedAt = new Date();
        if (status === BookingStatus.CANCELLED) booking.cancelledAt = new Date();

        await booking.save();
        return booking;
    }

    async rescheduleBooking(providerId: string, bookingId: string, newTime: Date): Promise<any> {
        const booking = await this.bookingModel.findOne({ _id: new Types.ObjectId(bookingId), providerId: new Types.ObjectId(providerId) });
        if (!booking) throw new NotFoundException('Booking not found');
        booking.scheduledAt = newTime;
        booking.status = 'pending';
        await booking.save();
        return booking;
    }

    async startService(providerId: string, bookingId: string, otp: string, beforeImages: string[]): Promise<any> {
        const booking = await this.bookingModel.findOne({ _id: new Types.ObjectId(bookingId), providerId: new Types.ObjectId(providerId) });
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.otp !== otp) throw new BadRequestException('Invalid OTP');
        booking.status = 'started';
        booking.startedAt = new Date();
        booking.beforeImages = beforeImages.slice(0, 5);
        await booking.save();
        return booking;
    }

    async completeService(providerId: string, bookingId: string, afterImages: string[], paymentMethod: 'cash' | 'upi'): Promise<any> {
        const booking = await this.bookingModel.findOne({ _id: new Types.ObjectId(bookingId), providerId: new Types.ObjectId(providerId) });
        if (!booking) throw new NotFoundException('Booking not found');
        if (booking.status !== 'started') throw new BadRequestException('Service not started yet');

        booking.status = 'completed';
        booking.completedAt = new Date();
        booking.afterImages = afterImages.slice(0, 5);
        booking.paymentMethod = paymentMethod;
        booking.paymentStatus = 'completed';
        await booking.save();

        const adminCommission = booking.amount * 0.1;
        const netEarning = booking.amount - adminCommission;
        await this.earningModel.create({
            providerId: booking.providerId,
            bookingId: booking._id,
            amount: booking.amount,
            adminCommission,
            netEarning
        });
        await this.userModel.findByIdAndUpdate(providerId, { $inc: { walletBalance: netEarning } });
        return booking;
    }

    async getEarnings(providerId: string): Promise<any> {
        const earnings = await this.earningModel.find({ providerId: new Types.ObjectId(providerId) }).lean();
        const total = earnings.reduce((sum, e) => sum + e.netEarning, 0);
        return { earnings, total };
    }
}
