import { config } from '@/common/config';
import { createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

const envToTransportConfig: Record<
  typeof config.NODE_ENV,
  SMTPTransport.Options
> = {
  development: {
    auth: {
      user: config.DEV_SMTP_SERVER_AUTH,
      pass: config.DEV_SMTP_SERVER_PASS,
    },
    service: 'gmail',
  },
  production: {},
  test: {},
} as const;

function getTransportConfig(): SMTPTransport.Options {
  const { NODE_ENV, DEV_SMTP_SERVER_AUTH, DEV_SMTP_SERVER_PASS } = config;

  if (
    NODE_ENV === 'development' &&
    (!DEV_SMTP_SERVER_AUTH || !DEV_SMTP_SERVER_PASS)
  ) {
    throw new Error('Missing development mode SMTP server config');
  }

  return envToTransportConfig[NODE_ENV];
}

export const transport = createTransport(getTransportConfig());
