import { t, UnwrapSchema } from 'elysia';

export const AuthDto = {
  sendOtp: t.Object({
    email: t.String({ format: 'email', examples: ['caiohperlin@gmail.com'] }),
  }),
  sendOtpResponse: t.Object({
    message: t.String({ examples: ['Código enviado com sucesso'] }),
  }),
  verifyOtp: t.Object({
    email: t.String({ format: 'email', examples: ['caiohperlin@gmail.com'] }),
    otp: t.String({ minLength: 6, maxLength: 6, examples: ['123456'] }),
  }),
  verifyOtpResponse: t.Object({
    message: t.String({ examples: ['Código verificado com sucesso'] }),
  }),
};

export type AuthDto = {
  [k in keyof typeof AuthDto]: UnwrapSchema<(typeof AuthDto)[k]>;
};
