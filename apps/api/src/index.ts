import { config } from '@/common/config';
import { AuthController } from '@/modules/auth/auth.controller';
import { docsPlugin } from '@/plugins/docs.plugin';
import { errorHandlerPlugin } from '@/plugins/error-handler.plugin';
import { loggerPlugin } from '@/plugins/logger.plugin';
import Elysia from 'elysia';

const v1 = new Elysia({ prefix: 'api/v1' }).use(AuthController);

const app = new Elysia()
  .use(loggerPlugin)
  .use(docsPlugin)
  .use(errorHandlerPlugin)
  .use(v1)
  .listen(config.PORT);

if (app.server) {
  const { hostname, port } = app.server;
  console.log(`API Listening at ${hostname}:${port}`);
}

export type App = typeof app;
