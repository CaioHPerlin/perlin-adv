import { config } from '@/common/config';
import { docs } from '@/lib/docs';
import { errorHandler } from '@/lib/error-handler';
import { logger } from '@/lib/logger';
import { AuthController } from '@/modules/auth/auth.controller';
import { Elysia } from 'elysia';

const app = new Elysia({ prefix: 'v1' })
  .use(logger.into())
  .use(errorHandler)
  .use(docs)
  .use(AuthController)
  .listen(config.PORT);

if (app.server) {
  const { hostname, port } = app.server;
  console.log(`API Listening at ${hostname}:${port}`);
}

export type App = typeof app;
