import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString, IsArray, IsNotEmpty, IsUrl } from 'class-validator';

export class UpdateAdminSettingDto {
  @IsString() @IsOptional() androidAppVersion?: string;
  @IsString() @IsOptional() iosAppVersion?: string;
  @IsBoolean() @IsOptional() androidForceUpdate?: boolean;
  @IsBoolean() @IsOptional() iosForceUpdate?: boolean;
  @IsString() @IsOptional() websiteVersion?: string;
  @IsString() @IsOptional() @IsUrl() iosAppLink?: string;
  @IsString() @IsOptional() @IsUrl() androidAppLink?: string;
  @IsBoolean() @IsOptional() maintenanceMode?: boolean;
  @IsNumber() @IsOptional() platformFee?: number;
  @IsNumber() @IsOptional() transactionFee?: number;
  @IsNumber() @IsOptional() commission?: number;
  @IsNumber() @IsOptional() welcomePoints?: number;
  @IsNumber() @IsOptional() visitingPoints?: number;
  @IsNumber() @IsOptional() dailyLoginPoints?: number;
  @IsNumber() @IsOptional() serviceBookingPoints?: number;
  @IsNumber() @IsOptional() serviceCompletionPoints?: number;
  @IsNumber() @IsOptional() profileCompletionPoints?: number;
  @IsNumber() @IsOptional() referralPoints?: number;
  @IsNumber() @IsOptional() maxDailyPoints?: number;
  @IsNumber() @IsOptional() defaultFirstPrizePoints?: number;
  @IsNumber() @IsOptional() defaultSecondPrizePoints?: number;
  @IsNumber() @IsOptional() defaultThirdPrizePoints?: number;
  @IsNumber() @IsOptional() earlyCompletionBonusPerHour?: number;
  @IsNumber() @IsOptional() participationPoints?: number;
  @IsNumber() @IsOptional() minParticipantsForChallenge?: number;
  @IsNumber() @IsOptional() maxParticipantsForChallenge?: number;
  @IsBoolean() @IsOptional() enableLeaderboard?: boolean;
  @IsBoolean() @IsOptional() enableMonthlyLeaderboard?: boolean;
  @IsNumber() @IsOptional() leaderboardTopCount?: number;
  @IsNumber() @IsOptional() boostServiceFee?: number;
  @IsNumber() @IsOptional() minPointsForRedemption?: number;
  @IsNumber() @IsOptional() pointsToCurrencyRate?: number;
  @IsBoolean() @IsOptional() onboardFeeVisibility?: boolean;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsOptional() pickNDropIncentive?: {
    ridesThreshold: number;
    amount: number;
  };
}

export class ChangePasswordDto {

  @ApiProperty({ example: 'password123', description: ' password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'password12', description: 'oldPassword' })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;
}

export class AddBiomatricDto {
  @ApiProperty({ required: false, example: 'WQEWEDBJWINDN878DNJNJNFDF' })
  @IsNotEmpty()
  @IsString()
  deviceId?: string;

  @ApiProperty({ example: 'qweghbmkrkmfsmf;l234mlnm,.n5mn345mnm2n35m,ln435m,3n5m,45nm4l3k5' })
  @IsString()
  @IsNotEmpty()
  signature: string;

  @ApiProperty({ example: 'face/fingerprint/iris' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
