import { redis } from 'bun';
import Elysia from 'elysia';
import { logger } from '../../lib/logger';
import { AuthDto } from './auth.dto';
import { AuthService } from './auth.service';
import { EmailService } from './email.service';

export const AuthController = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  .use(logger)
  .derive(({ log }) => ({
    service: new AuthService(redis, new EmailService(log)),
  }))
  .post(
    '/send-otp',
    async ({ body: { email }, service }) => {
      return service.sendOtp(email);
    },
    {
      body: AuthDto.sendOtp,
      response: AuthDto.sendOtpResponse,
      detail: {
        summary: 'Send OTP',
        description:
          'Generates a 6-digit OTP and sends it to the specified email address. The OTP is valid for 5 minutes.',
      },
    },
  )
  .post(
    '/verify-otp',
    async ({ body: { email, otp }, service }) => {
      return service.verifyOtp(email, otp);
    },
    {
      body: AuthDto.verifyOtp,
      response: AuthDto.verifyOtpResponse,
      detail: {
        summary: 'Verify OTP',
        description:
          'Verifies the provided OTP for the specified email address.',
      },
    },
  );
