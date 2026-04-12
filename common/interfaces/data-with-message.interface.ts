import { DataResponse } from './data-response.interface';

export interface DataWithMessage<T = any> {
  message: string;
  data: DataResponse<T>;
}
