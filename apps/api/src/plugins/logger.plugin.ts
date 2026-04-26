import { logger } from '@/common/logger';
import Elysia from 'elysia';

export const loggerPlugin = new Elysia({ name: 'logger' }).use(logger.into());
