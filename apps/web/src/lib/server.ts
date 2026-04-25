import { treaty } from '@elysiajs/eden';
import type { App } from '@perlin-adv/api';

export const server = treaty<App>('localhost:7777') as ReturnType<
  typeof treaty<App>
>;
