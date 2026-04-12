import { PaginatedResult } from "./paginated-result.interface";

export type DataResponse<T> = T | PaginatedResult<T>;
