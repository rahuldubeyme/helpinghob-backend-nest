import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument } from '@mongodb/schemas/booking.schema';
import { MerchantBookingListDto, MerchantVerifyOtpDto, UpdateBookingStatusDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
  ) { }

  async findAll(user: any, query: MerchantBookingListDto) {
    const filter: any = { isDeleted: false };
    if (user.role === 'vendor') filter.providerId = new Types.ObjectId(user.id);
    if (user.role === 'user') filter.userId = new Types.ObjectId(user.id);
    return this.bookingModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  async findRedemptions(providerId: string, query: MerchantBookingListDto) {
    return this.bookingModel.find({ providerId: new Types.ObjectId(providerId), isDeleted: false })
      .sort({ createdAt: -1 }).lean();
  }

  async findOne(user: any, id: string) {
    const booking = await this.bookingModel.findById(id).lean();
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async verifyOtp(providerId: string, id: string, dto: MerchantVerifyOtpDto) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    if (booking.otp !== dto.otp) throw new NotFoundException('Invalid OTP');
    booking.status = 'completed';
    await booking.save();
    return { success: true, data: booking };
  }

  async updateStatus(providerId: string, id: string, dto: UpdateBookingStatusDto) {
    const booking = await this.bookingModel.findByIdAndUpdate(id, { $set: { status: dto.status } }, { new: true });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return { success: true, data: booking };
  }
}
