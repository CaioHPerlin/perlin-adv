import { Elysia } from 'elysia';
import { config } from './common/config';
import { logger } from './lib/logger';

const app = new Elysia().use(logger).listen(config.PORT);

if (app.server) {
  const { hostname, port } = app.server;
  console.log(`API Listening at ${hostname}:${port}`);
}
