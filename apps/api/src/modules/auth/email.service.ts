import { Logger } from '@bogeychan/elysia-logger/types';

export class EmailService {
  constructor(private readonly log: Logger) {}

  async sendOtp(email: string, otp: string): Promise<boolean> {
    // @TODO: Implement email sending logic
    this.log.debug(`Sending OTP ${otp} to email ${email}`);
    return true;
  }
}
