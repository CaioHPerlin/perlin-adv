import { Elysia } from 'elysia';
import { config } from './common/config';
import { docs } from './lib/docs';
import { logger } from './lib/logger';

const app = new Elysia({ prefix: 'v1' })
	.use(docs)
	.use(logger)
	.listen(config.PORT);

if (app.server) {
	const { hostname, port } = app.server;
	console.log(`API Listening at ${hostname}:${port}`);
}
