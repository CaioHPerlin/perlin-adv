import { config } from '@/common/config';
import { createPinoLogger } from '@bogeychan/elysia-logger';
import { StandaloneLoggerOptions } from '@bogeychan/elysia-logger/types';

const envToStandaloneLoggerConfig: Record<
  typeof config.NODE_ENV,
  StandaloneLoggerOptions
> = {
  production: {
    level: config.LOG_LEVEL,
  },
  development: {
    level: 'trace',
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  test: {},
};

export const logger: ReturnType<typeof createPinoLogger> = createPinoLogger(
  envToStandaloneLoggerConfig[config.NODE_ENV],
);
