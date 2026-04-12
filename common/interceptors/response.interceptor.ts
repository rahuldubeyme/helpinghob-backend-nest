import { ApiResponse } from '@interfaces/response.interface';
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private readonly i18n: I18nService) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;

    // Language detection
    const lang = (request.headers['x-lang'] ||
      request.i18nLang ||
      (request.headers['accept-language']?.split(',')[0].split(';')[0]) ||
      request.user?.language ||
      'en').toLowerCase();

    return next.handle().pipe(
      mergeMap(async (data: any) => {
        const successStatusCodes: Record<string, number> = {
          GET: 200,
          POST: 201,
          PUT: 200,
          PATCH: 200,
          DELETE: 200,
        };

        // Map HTTP methods to i18n keys for default messages
        const methodMessageKeys: Record<string, string> = {
          GET: 'common.FETCHED_SUCCESS',
          POST: 'common.CREATED_SUCCESS',
          PUT: 'common.UPDATED_SUCCESS',
          PATCH: 'common.UPDATED_SUCCESS',
          DELETE: 'common.DELETED_SUCCESS',
        };

        let message: string;

        // If the resource returns a data object with its own message (custom response)
        if (data && typeof data === 'object' && !Array.isArray(data) && 'message' in data) {
          message = await this.translateMessage(data.message, lang);
        } else {
          // Use default translated message for the HTTP method
          const i18nKey = methodMessageKeys[method] || 'common.SUCCESS';
          message = (await this.i18n.translate(i18nKey, { lang })) as string;
        }

        // Handle pagination structure
        const isPaginated = data && Array.isArray(data.items) && typeof data.total === 'number';
        let responseData;

        if (Array.isArray(data)) {
          responseData = data;
        } else if (isPaginated) {
          responseData = {
            items: data.items,
            total: data.total,
            page: data.page,
            limit: data.limit,
          };
        } else if (data && typeof data === 'object') {
          const { message: resMessage, ...restData } = data;
          responseData = restData;
        } else {
          responseData = data;
        }

        const response: ApiResponse<T> = {
          success: true,
          message,
          data: responseData,
          statusCode: successStatusCodes[method] || 200,
          path: request.url,
          timestamp: new Date().toISOString(),
        };

        return response;
      })
    );
  }

  /**
   * Translates a message string or key based on the requested language.
   */
  private async translateMessage(message: string, lang: string): Promise<string> {
    // Reverse Map for legacy/static strings that may still come from some controllers
    // const legacyMessageMap: Record<string, string> = {
    //   'Fetched successfully': 'common.FETCHED_SUCCESS',
    //   'Created successfully': 'common.CREATED_SUCCESS',
    //   'Updated successfully': 'common.UPDATED_SUCCESS',
    //   'Deleted successfully': 'common.DELETED_SUCCESS',
    //   'Success': 'common.SUCCESS',
    //   'User not found': 'events.USER_NOT_FOUND',
    //   'Login successful': 'events.LOGIN_SUCCESS',
    //   'Invalid credentials': 'events.INVALID_CREDENTIALS',
    // };

    // If the message is already an i18n key (contains a dot) or matches a legacy string
    const i18nKey = message?.includes('.') ? message : null; //: legacyMessageMap[message];

    if (i18nKey) {
      try {
        const translated = await this.i18n.translate(i18nKey, { lang });
        // If the lib returns the key itself, it means the translation is missing from the file
        if (translated && translated !== i18nKey) {
          return translated as string;
        }
      } catch (error) {
        console.error(`[ResponseInterceptor] Translation error for key "${i18nKey}":`, error);
      }
    }

    return message;
  }
}
