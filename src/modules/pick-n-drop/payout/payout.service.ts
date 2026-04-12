import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payout, PayoutDocument, User, UserDocument } from '@mongodb/schemas';

@Injectable()
export class PayoutService {
    constructor(
        @InjectModel(Payout.name) private payoutModel: Model<PayoutDocument>,
        @InjectModel(User.name) private userModel: Model<UserDocument>,
    ) { }

    async getPayoutHistory(driverId: string) {
        return this.payoutModel.find({ driverId: new Types.ObjectId(driverId) }).sort({ createdAt: -1 }).lean();
    }

    async requestPayout(driverId: string, amount: number) {
        const driver = await this.userModel.findById(driverId);
        const walletBalance = driver?.earnings?.total || 0;

        if (walletBalance < amount) throw new BadRequestException('Insufficient balance');

        const payout = await this.payoutModel.create({
            driverId: new Types.ObjectId(driverId),
            amount,
            status: 'pending',
            currency: 'INR'
        });

        await this.userModel.findByIdAndUpdate(driverId, { $inc: { 'earnings.total': -amount } });

        return payout;
    }
}
