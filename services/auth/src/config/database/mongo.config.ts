import {
  EnvironmentVariables,
  NodeEnv,
} from '@config/environment/env.validation';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export const configMongoDB = (
  configService: ConfigService<EnvironmentVariables>,
): MongooseModuleFactoryOptions => {
  const logger = new Logger('MONGODB');
  const username = configService.get('MONGO_INITDB_ROOT_USERNAME');
  const password = configService.get('MONGO_INITDB_ROOT_PASSWORD');
  const host = configService.get('MONGO_DB_HOST');

  return {
    uri: `mongodb://${host}/auth`,
    auth: {
      username,
      password,
    },
    authSource: 'admin',
    retryWrites: true,
    retryReads: true,
    ...(configService.get('NODE_ENV') === NodeEnv.Production && {
      tls: true,
      tlsAllowInvalidCertificates: false,
      tlsAllowInvalidHostnames: false,
    }),
    autoIndex: process.env.NODE_ENV !== 'production',
    autoCreate: true,
    onConnectionCreate(connection: Connection) {
      connection.asPromise().catch((error) => logger.error(error));

      return connection;
    },
  };
};
