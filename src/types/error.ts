export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AI_PROVIDER_ERROR = 'AI_PROVIDER_ERROR',
}

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: Record<string, any>;
}
