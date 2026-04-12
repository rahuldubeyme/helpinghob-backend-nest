import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LanguageInterceptor implements NestInterceptor {
    constructor(private readonly i18n: I18nService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const lang = (request.headers['x-lang'] ||
            request.i18nLang ||
            (request.headers['accept-language']?.split(',')[0].split(';')[0]) ||
            request.user?.language ||
            'en').toLowerCase();

        return next.handle().pipe(
            map((data) => {
                if (lang === 'ar') {
                    return this.translateData(data);
                }
                return data;
            }),
        );
    }

    private translateData(data: any): any {
        if (!data || typeof data !== 'object') {
            return data;
        }

        if (Array.isArray(data)) {
            return data.map((item) => this.translateData(item));
        }

        const translatableFields = [
            ['name', 'nameAr'],
            ['title', 'titleAr'],
            ['description', 'descriptionAr'],
            ['rules', 'rulesAr'],
            ['questionText', 'questionTextAr'],
            ['options', 'optionsAr'],
        ];

        const newData = { ...data };

        // Process fields in current object
        for (const [enField, arField] of translatableFields) {
            if (newData[arField] && newData[arField] !== null) {
                newData[enField] = newData[arField];
            }
        }

        // Recursively process nested objects/arrays
        for (const key in newData) {
            if (newData[key] && typeof newData[key] === 'object') {
                newData[key] = this.translateData(newData[key]);
            }
        }

        return newData;
    }
}
