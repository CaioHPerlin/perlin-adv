import { logger as ElysiaLogger } from '@bogeychan/elysia-logger';
import { config } from '../common/config';

type LoggerOptions = Parameters<typeof ElysiaLogger>[0];

const envToLoggerConfig: Record<typeof config.NODE_ENV, LoggerOptions> = {
  production: {
    autoLogging: true,
    level: config.LOG_LEVEL,
  },
  development: {
    autoLogging: true,
    level: 'trace',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  test: {
    autoLogging: false,
  },
};

export const logger = ElysiaLogger(envToLoggerConfig[config.NODE_ENV]);
