import { Client } from 'pg';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
});
const client = new Client({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database:  process.env.POSTGRES_DB,
});

beforeAll(async () => {
  try {
    await client.connect();
    await client.query('DELETE FROM users;');
    await client.query('DELETE FROM addresses;');
    await client.end();
  } catch (_) {}

  try {
    await redis.connect();
    // const redisKeysCount = await redis.dbsize();
    // console.log(`[e2e cleanup] redis keys=${redisKeysCount}`);
    await redis.flushdb();
  } catch (_) {
    // Cleanup is best-effort for e2e.
  } finally {
    if (redis.status !== 'end') {
      await redis.quit();
    }
  }
});
