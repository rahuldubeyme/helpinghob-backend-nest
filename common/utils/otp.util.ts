import * as crypto from "crypto";
import { utcDateTime } from "./date.util";
import { ConfigService } from '@nestjs/config';



export const generateOtp = (length: number = 4): string => {
  let result = "";
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    result = "1234";
  } else {
    while (result.length < length) {
      result += crypto.randomInt(0, 9).toString();
    }
  }

  return result.padEnd(length, "0");
};

export const otpValidTill = (configService: ConfigService) => {
  const otpMinutes = parseInt(configService.get<string>('OTP_VALID_MINUTES') || '5', 10);
  return utcDateTime(new Date(utcDateTime().valueOf() + otpMinutes * 60000));
};



