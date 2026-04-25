import { AppError, BadRequestError } from '@/common/errors';
import { AuthDto } from './auth.dto';
import { EmailService } from './email.service';

export class AuthService {
  private readonly OTP_EXPIRATION_SECONDS = 60 * 5;

  constructor(
    private readonly redisClient: Bun.RedisClient,
    private readonly emailService: EmailService,
  ) {}

  private generateOtp(): string {
    const buffer = new Uint32Array(1);
    crypto.getRandomValues(buffer);
    const otp = buffer[0]! % 1_000_000;
    return otp.toString().padStart(6, '0');
  }

  private async storeOtp(email: string, otp: string) {
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
      throw new AppError('Falha ao armazenar o código OTP.');
    }

    const isEmailSent = await this.emailService.sendOtp(email, otp);
    if (!isEmailSent) {
      throw new AppError('Falha ao enviar o código OTP por e-mail.');
    }

    return {
      message: 'Código OTP enviado com sucesso',
    };
  }

  async verifyOtp(
    email: string,
    otp: string,
  ): Promise<AuthDto['verifyOtpResponse']> {
    const storedOtp = await this.getStoredOtp(email);

    if (!storedOtp) {
      throw new BadRequestError('Código expirado ou não encontrado.');
    }

    if (storedOtp !== otp) {
      throw new BadRequestError('Código inválido.');
    }

    this.redisClient.del(`otp:${email}`);

    return {
      message: 'Código verificado com sucesso',
    };
  }
}
