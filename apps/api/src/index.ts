import { Elysia } from 'elysia';
import { config } from './config';

const app = new Elysia()
  .decorate('config', config)
  .get('/', () => 'Hello Elysia')
  .listen(config.PORT);

if (app.server) {
  const { hostname, port } = app.server;
  console.log(`API Listening at ${hostname}:${port}`);
}
