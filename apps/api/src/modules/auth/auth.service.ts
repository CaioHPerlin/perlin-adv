import { Logger } from '@bogeychan/elysia-logger/types';
import { AuthDto } from './auth.dto';

export class AuthService {
  OTP_EXPIRATION_SECONDS = 60 * 5;

  constructor(
    private readonly log: Logger,
    private readonly redisClient: Bun.RedisClient,
  ) {}

  private generateOtp(): string {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const otp = buffer[0]! % 1_000_000;
    return otp.toString().padStart(6, '0');
  }

  private async storeOtp(email: string, otp: string) {
    this.log.debug(`Stored OTP ${otp} for email ${email}`);
    const key = `otp:${email}`;
    return this.redisClient.set(key, otp, 'EX', this.OTP_EXPIRATION_SECONDS);
  }

  async sendOtp(email: string): Promise<AuthDto['sendOtpResponse']> {
    const otp = this.generateOtp();
    const storeResult = await this.storeOtp(email, otp);

    if (storeResult !== 'OK') {
      throw new Error('Failed to store OTP');
    }

    // @TODO: Integrate with email service to send the OTP to the user's email
    return {
      success: true,
      message: 'OTP sent successfully',
    };
  }

  async verifyOtp(email: string, otp: string) {
    throw new Error('Method not implemented.');
  }
}
