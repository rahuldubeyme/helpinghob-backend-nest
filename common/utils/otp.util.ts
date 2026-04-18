import * as crypto from "crypto";
import { utcDateTime } from "./date.util";
import { ConfigService } from '@nestjs/config';



export const generateOtp = (length: number = 4): string => {
  // Always use fixed OTP in development for easy testing
  if (process.env.NODE_ENV === 'development') {
    return '1234';
  }
  let result = '';
  while (result.length < length) {
    result += crypto.randomInt(0, 10).toString();
  }
  return result;
};

export const otpValidTill = (configService: ConfigService) => {
  const otpMinutes = parseInt(configService.get<string>('OTP_VALID_MINUTES') || '5', 10);
  return utcDateTime(new Date(utcDateTime().valueOf() + otpMinutes * 60000));
};



