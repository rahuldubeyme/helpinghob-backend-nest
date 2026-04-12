import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString, IsOptional, IsNumber, IsBoolean, IsEmail, IsArray,
    MinLength, MaxLength, IsEnum
} from 'class-validator';

// ── Request Login OTP ─────────────────────────────────────────────────────────
export class RequestLoginOtpDto {
    @ApiProperty({ example: 1, description: 'Role type: 1=Customer, 2=Driver, 3=Merchant' })
    @IsNumber()
    roleType: number;

    @ApiProperty({ example: '+91' })
    @IsString()
    countryCode: string;

    @ApiProperty({ example: '9876543210' })
    @IsString()
    mobile: string;

    @ApiPropertyOptional({ example: 'fcm-device-token' })
    @IsString()
    @IsOptional()
    deviceToken?: string;
}

// ── Verify OTP ────────────────────────────────────────────────────────────────
export class VerifyOtpDto {
    @ApiProperty({ example: '+91' })
    @IsString()
    countryCode: string;

    @ApiProperty({ example: '9876543210' })
    @IsString()
    mobile: string;

    @ApiProperty({ example: '1234' })
    @IsString()
    otp: string;

    @ApiProperty({ description: 'Temporary JWT token received from request-login-otp' })
    @IsString()
    token: string;
}

// ── Resend OTP ────────────────────────────────────────────────────────────────
export class ResendOtpDto {
    @ApiProperty({ example: '+91' })
    @IsString()
    countryCode: string;

    @ApiProperty({ example: '9876543210' })
    @IsString()
    mobile: string;

    @ApiProperty({ description: 'Temporary JWT token' })
    @IsString()
    token: string;
}

// ── Create Profile ────────────────────────────────────────────────────────────
export class CreateProfileDto {
    @ApiProperty({ example: 'John Doe' })
    @IsString()
    fullName: string;

    @ApiProperty({ example: 'john@example.com' })
    @IsEmail()
    email: string;

    @ApiPropertyOptional({ example: 'https://s3.amazonaws.com/avatar.jpg' })
    @IsString()
    @IsOptional()
    avatar?: string;

    @ApiPropertyOptional({ example: '1995-08-15' })
    @IsString()
    @IsOptional()
    dob?: string;

    @ApiPropertyOptional({ example: 'Male', enum: ['Male', 'Female', 'Non-binary'] })
    @IsString()
    @IsOptional()
    gender?: string;
}

// ── Setup Profile (Driver/Merchant) ───────────────────────────────────────────
export class SetupProfileDto {
    @ApiPropertyOptional({ example: 1 })
    @IsNumber()
    @IsOptional()
    roleType?: number;

    @ApiPropertyOptional({ example: 'Driver' })
    @IsString()
    @IsOptional()
    role?: string;

    @ApiPropertyOptional() @IsString() @IsOptional() cityId?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() vehicleOwnerShip?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() vehicleId?: string;
    @ApiPropertyOptional() @IsBoolean() @IsOptional() haveHelmet?: boolean;
    @ApiPropertyOptional() @IsString() @IsOptional() vehicleNumber?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() vehicleColor?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() vehicleModelYear?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() vehicleModelId?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() aadharNumber?: string;
    @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() personalDoc?: string[];
    @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() vehicleDocuments?: string[];
    @ApiPropertyOptional() @IsNumber() @IsOptional() lat?: number;
    @ApiPropertyOptional() @IsNumber() @IsOptional() lng?: number;
    @ApiPropertyOptional() @IsString() @IsOptional() deviceToken?: string;
}

// ── Update Profile ────────────────────────────────────────────────────────────
export class UpdateProfileDto extends SetupProfileDto {
    @ApiPropertyOptional() @IsString() @IsOptional() fullName?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() avatar?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() gender?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() dob?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() bio?: string;
    @ApiPropertyOptional() @IsEmail() @IsOptional() email?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() shopName?: string;
}

// ── Setup Email / Phone ───────────────────────────────────────────────────────
export class SetupEmailDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    email: string;
}

export class SetupPhoneDto {
    @ApiProperty({ example: '+91' })
    @IsString()
    countryCode: string;

    @ApiProperty({ example: '9876543210' })
    @IsString()
    mobile: string;
}
