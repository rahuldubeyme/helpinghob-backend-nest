import { ApiExtension } from '@nestjs/swagger';

export type ApiTypeValues = 'user' | 'provider' | 'web' | 'api' | 'admin' | 'merchant' | 'employee' | 'vendor' | 'company' | 'customer';

export const ApiType = (type: ApiTypeValues | ApiTypeValues[]) =>
    ApiExtension('x-doc-type', Array.isArray(type) ? type.join(',') : type);
