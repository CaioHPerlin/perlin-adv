import { logger as ElysiaLogger } from '@bogeychan/elysia-logger';
import { config } from '../common/config';

export const logger = ElysiaLogger({
  level: config.LOG_LEVEL,
});
