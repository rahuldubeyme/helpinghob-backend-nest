// sms.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Twilio from 'twilio';

@Injectable()
export class SmsService {
  private client;

  constructor(private configService: ConfigService) {

    if(this.configService.get<string>('NODE_ENV') === 'production'){
      const sid = this.configService.get<string>('TWILIO_SID');
      const token = this.configService.get<string>('TWILIO_AUTH_TOKEN');
      this.client = Twilio(sid, token);
    } else{
      this.client = Twilio('ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', 'your_auth_token');
    }
  }

  async sendOtp(phone: string, otp: string): Promise<void> {
    try {

      if(this.configService.get<string>('NODE_ENV') === 'production'){
        await this.client.messages.create({
          body: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
          from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
          to: phone,
        });
      }

      console.log(`OTP sent to ${phone}`);
    } catch (error) {
      console.error('SMS sending failed:', error.message);
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }
}