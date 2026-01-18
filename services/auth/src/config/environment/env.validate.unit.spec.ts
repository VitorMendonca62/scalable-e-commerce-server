import { type Mock } from 'vitest';

import { EnvironmentVariables, NodeEnv } from './env.validation';

import * as classTransformer from 'class-transformer';
import * as classValidator from 'class-validator';
import { validateENV } from './env.validate';

describe('validateENV', () => {
  const mockEnv: EnvironmentVariables = {
    NODE_ENV: NodeEnv.Development,
    HOST: 'localhost',
    PORT: 8080,
    RABBITMQ_HOST: 'scalable-commerce-net',
    RABBITMQ_DEFAULT_USER: 'default',
    RABBITMQ_DEFAULT_PASS: '1234',
    AUTH_JWT_KEYID: 'jwtsecret123',
    MONGO_INITDB_ROOT_USERNAME: 'vhmendonca_test',
    MONGO_INITDB_ROOT_PASSWORD: '12345678',
    MONGO_DB_HOST: 'database-auth',
    MONGO_INITDB_DATABASE: 'database-auth',
    COOKIE_SECRET: 'secret',
    RESET_PASS_KEYID: 'keyid',
    REDIS_HOST: 'localhost',
    REDIS_PASSWORD: '1234',
    SMTP_HOST: 'localhost',
    SMTP_PORT: 0,
    SMPT_USER_ID: '123',
    SMPT_USER_PASSWORD: '13214',
    EMAIL_FROM_FOR_FORGOT_PASSWORD: '1323',
    GOOGLE_CLIENT_SECRET: '132',
    GOOGLE_CLIENT_ID: 'daw',
    GOOGLE_CALLBACK_URL: 'dawdwa',
  };

  const mockInstance = new EnvironmentVariables();
  mockInstance.NODE_ENV = NodeEnv.Development;
  mockInstance.HOST = 'localhost';
  mockInstance.PORT = 8080;
  mockInstance.RABBITMQ_HOST = 'scalable-commerce-net';
  mockInstance.RABBITMQ_DEFAULT_USER = 'default';
  mockInstance.RABBITMQ_DEFAULT_PASS = '1234';
  mockInstance.AUTH_JWT_KEYID = 'jwtsecret123';
  mockInstance.MONGO_INITDB_ROOT_USERNAME = 'vhmendonca_test';
  mockInstance.MONGO_INITDB_ROOT_PASSWORD = '12345678';
  mockInstance.MONGO_DB_HOST = 'database-auth';
  mockInstance.MONGO_INITDB_DATABASE = 'database-auth';
  mockInstance.COOKIE_SECRET = 'secret';
  mockInstance.RESET_PASS_KEYID = 'keyid';
  mockInstance.REDIS_HOST = 'localhost';
  mockInstance.REDIS_PASSWORD = '1234';
  mockInstance.SMTP_HOST = 'localhost';
  mockInstance.SMTP_PORT = 0;
  mockInstance.SMPT_USER_ID = '123';
  mockInstance.SMPT_USER_PASSWORD = '13214';
  mockInstance.EMAIL_FROM_FOR_FORGOT_PASSWORD = '1323';
  mockInstance.GOOGLE_CLIENT_SECRET = '132';
  mockInstance.GOOGLE_CLIENT_ID = 'daw';
  mockInstance.GOOGLE_CALLBACK_URL = 'dawdwa';
  let plainToInstanceMocked: Mock;
  let validateSyncMocked: Mock;

  beforeAll(() => {
    plainToInstanceMocked = vi.spyOn(classTransformer, 'plainToInstance');

    validateSyncMocked = vi.spyOn(classValidator, 'validateSync');
  });

  beforeEach(() => {
    plainToInstanceMocked.mockReturnValue(mockInstance);
    validateSyncMocked.mockReturnValue([]);
  });

  it('should return validated config when valid', () => {
    const result = validateENV(mockEnv);

    expect(plainToInstanceMocked).toHaveBeenCalledWith(
      EnvironmentVariables,
      mockEnv,
      {
        enableImplicitConversion: true,
      },
    );

    expect(validateSyncMocked).toHaveBeenCalledWith(mockInstance, {
      skipMissingProperties: false,
    });

    expect(result).toEqual(mockInstance);
  });

  it('should throw error if validation fails', () => {
    const mockError = {
      constraints: {
        isString: 'NODE_ENV must be a string',
      },
    };

    validateSyncMocked.mockReturnValue([mockError]);

    expect(() => validateENV(mockEnv)).toThrow('NODE_ENV must be a string');
  });
});
