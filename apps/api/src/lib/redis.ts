import { config } from '@/common/config';
import { RedisClient } from 'bun';

function createRedisClient(url: string) {
  return new RedisClient(url);
}

export const redisClient = createRedisClient(config.REDIS_URL);
