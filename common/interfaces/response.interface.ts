import { DataResponse } from "./data-response.interface";
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: DataResponse<T>;
  statusCode: number;
  path: string;
  timestamp?: string;
}
