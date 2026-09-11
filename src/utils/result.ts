import { AppError } from '@/types/error';

export type Result<T, E = AppError> =
  | { success: true; data: T }
  | { success: false; error: E };

export const success = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const failure = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});
