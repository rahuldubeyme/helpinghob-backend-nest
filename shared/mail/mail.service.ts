import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private readonly MAX_RETRIES = 3;
    private readonly RETRY_DELAY = 2000; // 2 seconds

    constructor(private mailerService: MailerService) { }

    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async sendWithRetry(
        sendFn: () => Promise<any>,
        retries: number = this.MAX_RETRIES,
        attempt: number = 1
    ): Promise<any> {
        try {
            return await sendFn();
        } catch (error) {
            this.logger.error(
                `Email send attempt ${attempt} failed: ${error.message}`,
                error.stack
            );

            if (attempt < retries) {
                this.logger.log(`Retrying in ${this.RETRY_DELAY}ms... (Attempt ${attempt + 1}/${retries})`);
                await this.delay(this.RETRY_DELAY);
                return this.sendWithRetry(sendFn, retries, attempt + 1);
            }

            throw error;
        }
    }

    async sendWelcomeEmail(user: any): Promise<void> {
        try {
            await this.sendWithRetry(async () => {
                return await this.mailerService.sendMail({
                    to: user.email,
                    subject: 'Welcome to Fivra!',
                    template: './welcome',
                    context: {
                        name: user.name,
                        role: user.role,
                        password: user.password,
                        loginUrl: user.loginUrl,
                    },
                });
            });
            this.logger.log(`Welcome email sent successfully to: ${user.email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send welcome email to ${user.email} after retries:`,
                error.message
            );
            // Don't throw - log and continue
        }
    }

    async sendForgotPasswordEmail(
        user: { email: string; name: string },
        otp: string
    ): Promise<void> {
        try {
            await this.sendWithRetry(async () => {
                return await this.mailerService.sendMail({
                    to: user.email,
                    subject: 'Reset Your Password - Fivra',
                    template: './forgot-password',
                    context: {
                        name: user.name,
                        otp,
                    },
                });
            });
            this.logger.log(`OTP email sent successfully to: ${user.email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send OTP email to ${user.email} after retries:`,
                error.message
            );
            // Don't throw - log and continue
        }
    }

    async sendOtpEmail(
        email: string,
        name: string,
        otp: string
    ): Promise<void> {
        try {
            await this.sendWithRetry(async () => {
                return await this.mailerService.sendMail({
                    to: email,
                    subject: 'Your OTP Code - Fivra',
                    template: './forgot-password',
                    context: {
                        name,
                        otp,
                    },
                });
            });
            this.logger.log(`OTP email sent successfully to: ${email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send OTP email to ${email} after retries:`,
                error.message
            );
            // Don't throw - log and continue
        }
    }

    async sendProfileStatusEmail(user: any): Promise<void> {
        try {
            await this.sendWithRetry(async () => {
                return await this.mailerService.sendMail({
                    to: user.email,
                    subject: 'Profile updated - Fivra!',
                    template: './profile-status',
                    context: {
                        name: user.name,
                        profileStatus: user.profileStatus,
                        loginUrl: `https://www.konstantlab.com/fivra-admin/login`,
                    },
                });
            });
            this.logger.log(`Profile status email sent successfully to: ${user.email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send profile status email to ${user.email} after retries:`,
                error.message
            );
            // Don't throw - log and continue
        }
    }

    async sendMerchantServiceApprovalEmail(user: any): Promise<void> {
        try {
            await this.sendWithRetry(async () => {
                return await this.mailerService.sendMail({
                    to: user.email,
                    subject: 'Service Approval - Fivra!',
                    template: './service-approval',
                    context: {
                        name: user.name,
                        serviceName: user.serviceName,
                    },
                });
            });
            this.logger.log(`Service approval email sent successfully to: ${user.email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send service approval email to ${user.email} after retries:`,
                error.message
            );
            // Don't throw - log and continue
        }
    }

    async sendServiceBoostRequestEmail(user: any): Promise<void> {
        try {
            await this.sendWithRetry(async () => {
                return await this.mailerService.sendMail({
                    to: user.email,
                    subject: 'Service Boost Request - Fivra!',
                    template: './service-boost-request',
                    context: {
                        name: user.name,
                        serviceName: user.serviceName,
                        days: user.days
                    },
                });
            });
            this.logger.log(`Service boost request email sent successfully to: ${user.email}`);
        } catch (error) {
            this.logger.error(
                `Failed to send service boost request email to ${user.email} after retries:`,
                error.message
            );
            // Don't throw - log and continue
        }
    }
}
