import { redisClient } from '@/lib/redis';
import { AuthDto } from '@/modules/auth/auth.dto';
import { AuthService } from '@/modules/auth/auth.service';
import { EmailService } from '@/modules/auth/email.service';
import Elysia from 'elysia';

export const AuthController = new Elysia({ prefix: '/auth', tags: ['Auth'] })
  .decorate('authService', new AuthService(redisClient, new EmailService()))
  .post(
    '/send-otp',
    async ({ body: { email }, authService }) => {
      return authService.sendOtp(email);
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
    async ({ body: { email, otp }, authService }) => {
      return authService.verifyOtp(email, otp);
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
