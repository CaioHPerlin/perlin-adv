import { DefaultResponse } from '@/common/dto';
import { t, UnwrapSchema } from 'elysia';

export const AuthDto = {
  sendOtp: t.Object({
    email: t.String({ format: 'email', examples: ['caiohperlin@gmail.com'] }),
  }),
  sendOtpResponse: DefaultResponse,
  verifyOtp: t.Object({
    email: t.String({ format: 'email', examples: ['caiohperlin@gmail.com'] }),
    otp: t.String({ minLength: 6, maxLength: 6, examples: ['123456'] }),
  }),
  verifyOtpResponse: DefaultResponse,
};

export type AuthDto = {
  [k in keyof typeof AuthDto]: UnwrapSchema<(typeof AuthDto)[k]>;
};
