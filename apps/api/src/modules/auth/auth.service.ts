import { Logger } from '@bogeychan/elysia-logger/types';
import { AuthDto } from './auth.dto';

export class AuthService {
  private readonly OTP_EXPIRATION_SECONDS = 60 * 5;

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

  private async getStoredOtp(email: string): Promise<string | null> {
    const key = `otp:${email}`;
    const otp = await this.redisClient.get(key);
    return otp;
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

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<AuthDto['verifyOtpResponse']> {
    const storedOtp = await this.getStoredOtp(email);

    if (!storedOtp) {
      throw new Error('OTP expired or not found');
    }

    if (storedOtp !== otp) {
      throw new Error('Invalid OTP');
    }

    this.redisClient.del(`otp:${email}`);

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  }
}
