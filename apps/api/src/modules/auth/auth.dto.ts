import { t, UnwrapSchema } from 'elysia';

export const AuthDto = {
  sendOtp: t.Object({
    email: t.String({ format: 'email' }),
  }),
  sendOtpResponse: t.Object({
    success: t.Boolean(),
    message: t.String(),
  }),
};

export type AuthDto = {
  [k in keyof typeof AuthDto]: UnwrapSchema<(typeof AuthDto)[k]>;
};
