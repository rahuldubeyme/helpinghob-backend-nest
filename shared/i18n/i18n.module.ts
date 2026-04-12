import { Module, Global } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule as NestI18nModule, QueryResolver, HeaderResolver } from 'nestjs-i18n';
import * as path from 'path';

@Global()
@Module({
    imports: [
        NestI18nModule.forRoot({
            fallbackLanguage: 'en',
            loaderOptions: {
                path:
                    process.env.NODE_ENV === 'production'
                        ? path.join(process.cwd(), 'dist/shared/i18n/locales')
                        : path.join(process.cwd(), 'shared/i18n/locales'),
                watch: process.env.NODE_ENV !== 'production',
            },
            resolvers: [
                { use: QueryResolver, options: ['lang'] },
                new HeaderResolver(['x-custom-lang']),
                AcceptLanguageResolver,
            ]
        }),
    ],
    exports: [NestI18nModule],
})
export class I18nModule { }
