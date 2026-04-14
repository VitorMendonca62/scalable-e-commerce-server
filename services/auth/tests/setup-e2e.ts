import mongoose from 'mongoose';
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  lazyConnect: true,
});

beforeAll(async () => {
  try {
    const username = process.env.MONGO_INITDB_ROOT_USERNAME;
    const password = process.env.MONGO_INITDB_ROOT_PASSWORD;
    const host = process.env.MONGO_DB_HOST;
    const database = process.env.MONGO_INITDB_DATABASE;

    await mongoose.connect(`mongodb://${host}/${database}`, {
      auth: {
        username,
        password,
      },
      authSource: 'admin',
    });

    // const collections = await mongoose.connection.db
    //   .listCollections({}, { nameOnly: true })
    //   .toArray();
    // const collectionNames = collections.map((collection) => collection.name);
    // let totalDocs = 0;

    // for (const name of collectionNames) {
    //   const count = await mongoose.connection.db
    //     .collection(name)
    //     .countDocuments();
    //   totalDocs += count;
    // }

    // console.log(
    //   `[e2e cleanup] mongo collections=${collectionNames.length} docs=${totalDocs}`,
    // );

    await mongoose.connection.db.dropDatabase();


    
  } catch (_) {
  }

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
