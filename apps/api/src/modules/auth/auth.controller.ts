import { redis } from 'bun';
import Elysia from 'elysia';
import { logger } from '../../lib/logger';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';

export const AuthController = new Elysia({ prefix: '/auth' })
  .use(logger)
  .derive(({ log }) => ({ service: new AuthService(log, redis) }))
  .post(
    '/send-otp',
    async ({ body, service }) => {
      return service.sendOtp(body.email);
    },
    {
      body: AuthDto.sendOtp,
      response: AuthDto.sendOtpResponse,
    },
  );
