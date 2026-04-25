import { AppError } from '@/common/errors';
import Elysia from 'elysia';

export const errorHandler = new Elysia({ name: 'error-handler' }).onError(
  { as: 'global' },
  ({ error, code, set }) => {
    if (error instanceof AppError) {
      set.status = error.statusCode;
      return { message: error.message };
    }

    if (code === 'VALIDATION') {
      set.status = 422;
      return { message: 'Invalid request data.' };
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return { message: 'Route not found.' };
    }

    set.status = 500;
    return { message: 'Internal server error.' };
  },
);
