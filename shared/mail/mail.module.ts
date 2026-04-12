import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { existsSync } from 'fs';
import { MailService } from './mail.service';

@Global()
@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (config: ConfigService) => {
                const mailPort = parseInt(config.get('MAIL_PORT') || '465', 10);
                const isSecure = mailPort === 465;

                // Resolve template directory - handle both development and production
                let templateDir = join(__dirname, 'templates');
                
                // In production, __dirname points to dist/shared/mail
                // In development, __dirname points to shared/mail
                // Check if templates exist at the current location
                if (!existsSync(templateDir)) {
                    // Try alternative path for development
                    const altPath = join(process.cwd(), 'shared/mail/templates');
                    if (existsSync(altPath)) {
                        templateDir = altPath;
                    }
                }

                return {
                    transport: {
                        host: config.get('MAIL_HOST'),
                        port: mailPort,
                        secure: isSecure,
                        auth: {
                            user: config.get('MAIL_USER'),
                            pass: config.get('MAIL_PASS'),
                        },
                        tls: {
                            rejectUnauthorized: false,
                            minVersion: 'TLSv1.2',
                        },
                        connectionTimeout: 10000,
                        socketTimeout: 10000,
                        pool: {
                            maxConnections: 5,
                            maxMessages: 100,
                            rateDelta: 4000,
                            rateLimit: 14,
                        },
                    },
                    defaults: {
                        from: config.get('MAIL_FROM') || 'noreply@fivra.com',
                    },
                    template: {
                        dir: templateDir,
                        adapter: new EjsAdapter({
                            inlineCssEnabled: false,
                        }),
                        options: {
                            strict: false,
                        },
                    },
                };
            },
        }),
    ],
    providers: [MailService],
    exports: [MailService],
})
export class MailModule { }
