import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { LOGIN_TYPE } from '@common/constant';

/**
 * Note: Most DTOs previously in this file were moved to app-user-auth.dto.ts 
 * for the simplified B2C OTP flow. Legacy B2B DTOs have been removed.
 */

export class ForgotPasswordDto {
  @ApiProperty({ enum: LOGIN_TYPE, example: 'EMAIL' })
  @IsEnum(LOGIN_TYPE)
  @IsNotEmpty()
  loginType: LOGIN_TYPE;

  @ApiProperty({ required: false, example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false, example: '+1' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ required: false, example: '1234567890' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: 'NewPass@123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string;
}
