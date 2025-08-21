import { EnvironmentVariables } from '@config/environment/env.validation';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';

export const configMongoDB = (
  configService: ConfigService<EnvironmentVariables>,
) => {
  const username = configService.get('MONGO_INITDB_ROOT_USERNAME');
  const password = configService.get('MONGO_INITDB_ROOT_PASSWORD');
  const database = configService.get('MONGO_INITDB_DATABASE');
  const uri = `mongodb://${username}:${password}@database-auth:27017/${database}`;
  new Logger('MONGODB').debug(uri);

  return {
    uri,
    onConnectionCreate(connection: Connection) {
      connection
        .asPromise()
        .then(() => new Logger('MongoDB').debug(`MongoDB running in ${uri}`))
        .catch((error) => new Logger('TEfe').error(error));

      return connection;
    },
  };
};
