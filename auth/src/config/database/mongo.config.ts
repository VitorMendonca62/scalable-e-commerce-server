import { EnvironmentVariables } from '@config/environment/env.validation';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

export const configMongoDB = (
  configService: ConfigService<EnvironmentVariables>,
) => {
  const username = configService.get('MONGO_INITDB_ROOT_USERNAME');
  const password = configService.get('MONGO_INITDB_ROOT_PASSWORD');
  const host = configService.get('MONGO_DB_HOST');
  const uri = `mongodb://${username}:${password}@${host}:27017/auth?authSource=admin`;

  return {
    uri,
    onConnectionCreate(connection: Connection) {
      connection
        .asPromise()
        .then(() => new Logger('MongoDB').debug(`MongoDB running in ${uri}`))
        .catch((error) => new Logger('MongoDB').error(error));

      return connection;
    },
  };
};
