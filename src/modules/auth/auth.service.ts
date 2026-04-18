import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { generateOtp, mapRoleNumber, mapRoleName, sanitizeUser } from "@common/utils";

import { User, UserDocument, TempMobile, TempMobileDocument } from "@mongodb/schemas";

import {
    RequestLoginOtpDto, VerifyOtpDto, ResendOtpDto,
    CreateProfileDto, SetupProfileDto, UpdateProfileDto,
    SetupEmailDto, SetupPhoneDto
} from "./dto/app-user-auth.dto";

import { MailService } from "@mail/mail.service";
import { SmsService } from "@shared/sms/sms.service";

const isOtpExpired = (expiry: Date) => new Date() > expiry;

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        @InjectModel(TempMobile.name) private readonly tempMobileModel: Model<TempMobileDocument>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private mailService: MailService,
        private readonly smsService: SmsService,
    ) { }


    // ── 1. Request Login OTP ────────────────────────────────────────────────────
    async requestLoginOtp(dto: RequestLoginOtpDto) {
        let { roleType, countryCode, mobile, deviceToken } = dto;

        // Map numeric role to string if needed
        const mappedRole = mapRoleNumber(roleType);
        const mappedRoleName = mapRoleName(roleType);

        // Find or create user
        let user = await this.userModel.findOne({
            role: mappedRole,
            countryCode,
            mobile,
            isDeleted: false,
        });

        if (user?.isSuspended) {
            throw new BadRequestException('Your account has been suspended. Please contact Admin.');
        }

        const now = Date.now();

        if (!user) {
            user = await this.userModel.create({
                role: mappedRole,
                roleName: mappedRoleName,
                countryCode,
                mobile,
                authTokenIssuedAt: now
            });
        } else {
            user.authTokenIssuedAt = now;
            await user.save();
        }

        // Generate OTP
        const otp = generateOtp();
        const validMinutes = parseInt(this.configService.get('OTP_VALID_MINUTES', '15'), 10);
        const validTill = new Date(Date.now() + validMinutes * 60000);

        await this.tempMobileModel.findOneAndUpdate(
            { mobile, countryCode },
            { $set: { mobile, countryCode, otp, isVerify: false, validTill } },
            { upsert: true, new: true },
        );

        // Log OTP only in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[AUTH] OTP for ${countryCode}${mobile} → ${otp} (Role: ${mappedRole})`);
        }

        // Sign temporary JWT
        const tempToken = this.jwtService.sign(
            { id: user._id, temp: true },
            { secret: this.configService.get('JWT_SECRET_TEMP'), expiresIn: '30m' },
        );

        return {
            tempToken,
            imageBaseUrl: this.configService.get('AWS_S3_BASE', ''),
            message: 'Otp sent on registred mobile number.'
        };
    }

    // ── 2. Verify OTP ───────────────────────────────────────────────────────────
    async verifyOtp(dto: VerifyOtpDto) {
        const { mobile, countryCode, otp, token } = dto;

        // Validate temp token
        let decoded: any;
        try {
            decoded = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET_TEMP'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (!decoded?.id) throw new UnauthorizedException('Invalid token payload');

        const user = await this.userModel.findOne({ _id: decoded.id, isDeleted: false });
        if (!user) throw new UnauthorizedException('User not found');

        // Validate OTP record
        const tempOtp = await this.tempMobileModel.findOne({
            mobile,
            countryCode,
            otp,
            isVerify: false,
        });

        if (!tempOtp) throw new BadRequestException('Invalid OTP');
        if (isOtpExpired(tempOtp.validTill)) throw new BadRequestException('OTP has expired');

        // Update user - mark mobile verified
        user.mobile = mobile;
        user.countryCode = countryCode;
        user.mobileVerify = true;
        user.otpVerified = true;
        user.formattedNumber = countryCode + mobile;
        user.authTokenIssuedAt = Date.now();
        await user.save();

        // Invalidate OTP
        await this.tempMobileModel.findByIdAndUpdate(tempOtp._id, {
            $set: { otp: '', isVerify: true },
        });

        // Issue final auth token
        const finalToken = this.jwtService.sign(
            { id: user._id, role: user.role },
            { secret: this.configService.get('JWT_SECRET'), expiresIn: '30d' },
        );

        return {
            token: finalToken,
            user: sanitizeUser(user),
            imageBaseUrl: this.configService.get('AWS_S3_BASE', ''),
            message: 'Otp verified successfully.'
        };
    }

    // ── 3. Resend OTP ───────────────────────────────────────────────────────────
    async resendOtp(dto: ResendOtpDto) {
        const { mobile, countryCode, token } = dto;

        let decoded: any;
        try {
            decoded = this.jwtService.verify(token, {
                secret: this.configService.get('JWT_SECRET_TEMP'),
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired token');
        }

        if (!decoded?.id) throw new UnauthorizedException('Invalid token');
        const user = await this.userModel.findOne({ _id: decoded.id, isDeleted: false });
        if (!user) throw new UnauthorizedException('User not found');

        const otp = generateOtp();
        const validMinutes = parseInt(this.configService.get('OTP_VALID_MINUTES', '15'), 10);
        const validTill = new Date(Date.now() + validMinutes * 60000);

        await this.tempMobileModel.findOneAndUpdate(
            { countryCode, mobile },
            { $set: { countryCode, mobile, otp, validTill, isVerify: false } },
            { upsert: true },
        );

        if (process.env.NODE_ENV === 'development') {
            console.log(`[AUTH] Resend OTP for ${countryCode}${mobile} → ${otp}`);
        }

        return { message: 'Otp sent successfully.' };
    }

    // ── 4. Create Profile (basic info after OTP) ────────────────────────────────
    async createProfile(userId: string, dto: CreateProfileDto, headers: any) {
        const { fullName, email, avatar, dob, gender } = dto;
        const language = headers['language'] || 'en';

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        user.fullName = fullName;
        if (email) user.email = email;
        if (avatar) user.avatar = avatar;
        if (dob) user.dob = dob;
        if (gender) user.gender = gender;
        await user.save();

        return {
            user: sanitizeUser(user),
            language,
            imageBaseUrl: this.configService.get('AWS_S3_BASE', ''),
            message: 'Profile create success'
        };
    }

    // ── 5. Setup Profile (driver/merchant specific) ─────────────────────────────
    async setupProfile(userId: string, dto: SetupProfileDto, headers: any) {
        const { roleType, role: roleName, vehicleOwnerShip, vehicleId, haveHelmet,
            vehicleNumber, vehicleColor, vehicleModelYear, vehicleModelId, aadharNumber,
            personalDoc, vehicleDocuments, lat, lng } = dto;
        const language = headers['language'] || 'en';

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (roleType !== undefined) {
            user.role = mapRoleNumber(roleType);
            user.roleName = mapRoleName(roleType);
        }
        if (roleName) user.roleName = roleName;

        // Only update vehicle info for driver role
        if (user.roleName === 'driver') {
            user.vehicle = {
                ...user.vehicle,
                vehicleOwnerShip: vehicleOwnerShip ?? user.vehicle?.vehicleOwnerShip,
                haveHelmet: haveHelmet !== undefined ? (haveHelmet === true) : user.vehicle?.haveHelmet,
                aadharNumber: aadharNumber ?? user.vehicle?.aadharNumber,
                personalDoc: personalDoc ?? user.vehicle?.personalDoc,
                vehicleDocuments: vehicleDocuments ?? user.vehicle?.vehicleDocuments,
                vehicleId: (vehicleId && Types.ObjectId.isValid(vehicleId)) ? new Types.ObjectId(vehicleId) : user.vehicle?.vehicleId,
                numberPlate: vehicleNumber ?? user.vehicle?.numberPlate,
                color: vehicleColor ?? user.vehicle?.color,
                year: vehicleModelYear ?? user.vehicle?.year,
                modelId: vehicleModelId ?? user.vehicle?.modelId,
            };
        }

        if (user.roleName === 'merchant'){
            // TODO: merchant-specific setup
        }

        if (user.roleName === 'vendor'){
            // TODO: vendor-specific setup
        }


        if (lat !== undefined && lng !== undefined) {
            user.location = [lng, lat];
        }

        await user.save();
        return { language };
    }

    // ── 6. Update Profile (full update) ────────────────────────────────────────
    async updateProfile(userId: string, dto: UpdateProfileDto, headers: any) {
        const { fullName, avatar, gender, dob, bio, email, shopName, roleType, role: roleName,
            vehicleOwnerShip, vehicleId, haveHelmet, vehicleNumber, vehicleColor, vehicleModelYear,
            vehicleModelId, aadharNumber, personalDoc, vehicleDocuments, lat, lng } = dto;
        const language = headers['language'] || 'en';

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        if (fullName) user.fullName = fullName;
        if (avatar) user.avatar = avatar;
        if (gender) user.gender = gender;
        if (dob) user.dob = dob;
        if (bio) user.bio = bio;

        if (roleType !== undefined) {
            user.role = mapRoleNumber(roleType);
            user.roleName = mapRoleName(roleType);
        }
        if (roleName) user.roleName = roleName;
        if (shopName) user.shop = { ...user.shop, name: shopName };

        if (email && email !== user.email) {
            const existing = await this.userModel.findOne({
                email, emailVerify: true, isDeleted: false, _id: { $ne: user._id },
            });
            if (existing) throw new BadRequestException('Email already in use by another account');
            user.email = email;
            user.emailVerify = false;
        }

        if (vehicleId || vehicleNumber || vehicleColor) {
            user.vehicle = {
                ...user.vehicle,
                vehicleId: (vehicleId && Types.ObjectId.isValid(vehicleId)) ? new Types.ObjectId(vehicleId) : user.vehicle?.vehicleId,
                numberPlate: vehicleNumber ?? user.vehicle?.numberPlate,
                color: vehicleColor ?? user.vehicle?.color,
                year: vehicleModelYear ?? user.vehicle?.year,
                modelId: vehicleModelId ?? user.vehicle?.modelId,
                vehicleOwnerShip: vehicleOwnerShip ?? user.vehicle?.vehicleOwnerShip,
                haveHelmet: haveHelmet !== undefined ? (haveHelmet === true) : user.vehicle?.haveHelmet,
                aadharNumber: aadharNumber ?? user.vehicle?.aadharNumber,
                personalDoc: personalDoc ?? user.vehicle?.personalDoc,
                vehicleDocuments: vehicleDocuments ?? user.vehicle?.vehicleDocuments,
            };
        }

        if (lat !== undefined && lng !== undefined) {
            user.location = [lng, lat];
        }

        await user.save();

        const finalToken = this.jwtService.sign(
            { id: user._id, role: user.role },
            { secret: this.configService.get('JWT_SECRET'), expiresIn: '30d' },
        );

        return {
            user: sanitizeUser(user),
            token: finalToken,
            language,
            baseAvatarUrl: this.configService.get('AWS_S3_BASE', ''),
        };
    }

    // ── 7. Setup Email ──────────────────────────────────────────────────────────
    async setupEmail(userId: string, dto: SetupEmailDto, headers: any) {
        const { email } = dto;
        const language = headers['language'] || 'en';

        const existing = await this.userModel.findOne({
            email, emailVerify: true, isDeleted: false, _id: { $ne: new Types.ObjectId(userId) },
        });
        if (existing) throw new BadRequestException('Email already exists');

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const otp = generateOtp();
        const validMinutes = parseInt(this.configService.get('OTP_VALID_MINUTES', '15'), 10);

        user.email = email;
        user.emailVerify = false;
        user.validTill = new Date(Date.now() + validMinutes * 60000);
        await user.save();

        if (process.env.NODE_ENV === 'development') {
            console.log(`[AUTH] Email OTP for ${email} → ${otp}`);
        }
        return { language };
    }

    // ── 8. Setup Phone ──────────────────────────────────────────────────────────
    async setupPhone(userId: string, dto: SetupPhoneDto, headers: any) {
        const { countryCode, mobile } = dto;
        const language = headers['language'] || 'en';

        const existing = await this.userModel.findOne({
            countryCode, mobile, isDeleted: false, _id: { $ne: new Types.ObjectId(userId) },
        });
        if (existing) throw new BadRequestException('Mobile number already in use');

        const user = await this.userModel.findById(userId);
        if (!user) throw new NotFoundException('User not found');

        const otp = generateOtp();
        const validMinutes = parseInt(this.configService.get('OTP_VALID_MINUTES', '15'), 10);
        const validTill = new Date(Date.now() + validMinutes * 60000);

        user.countryCode = countryCode;
        user.mobile = mobile;
        user.mobileVerify = false;
        user.formattedNumber = countryCode + mobile;
        await user.save();

        await this.tempMobileModel.findOneAndUpdate(
            { countryCode, mobile },
            { $set: { countryCode, mobile, otp, validTill, isVerify: false } },
            { upsert: true, new: true },
        );

        if (process.env.NODE_ENV === 'development') {
            console.log(`[AUTH] Phone OTP for ${countryCode}${mobile} → ${otp}`);
        }
        return { language };
    }

}


