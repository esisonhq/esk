export type ErrorResponse = {
  success: false;
  message: string;
  error: ApiError;
};

export type ApiError = {
  code: number;
  message: string;
  timestamp: string;
  requestId: string;
  path: string;
  details?: unknown;
  stack?: unknown;
};
