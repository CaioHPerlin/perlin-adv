import { logger } from '@/lib/logger';
import { Logger } from '@bogeychan/elysia-logger/types';

export class EmailService {
  private logger: Logger = logger.child({ service: EmailService.name });

  async sendOtp(email: string, otp: string): Promise<boolean> {
    // @TODO: Implement email sending logic
    this.logger.debug(`Sending OTP ${otp} to email ${email}`);
    return true;
  }
}
