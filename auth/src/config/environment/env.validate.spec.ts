import { EnvironmentVariables, NodeEnv } from './env.validation';

import * as classTransformer from 'class-transformer';
import * as classValidator from 'class-validator';
import { validateENV } from './env.validate';

describe('validateENV', () => {
  const mockEnv: Record<string, unknown> = {
    NODE_ENV: 'development',
    HOST: 'localhost',
    PORT: 8080,
    MESSAGING_HOST: '127.0.0.1',
    MESSAGING_USER: 'default',
    MESSAGING_PW: '1234',
    MESSAGING_PORT: 6379,
    JWT_SECRET: 'jwtsecret123',
    API_TAG: 'test_auth',
    MONGO_DB_URL: 'mongodb://localhost:27017/test_auth_users',
  };

  const mockInstance = new EnvironmentVariables();
  mockInstance.NODE_ENV = NodeEnv.Development;
  mockInstance.HOST = 'localhost';
  mockInstance.PORT = 8080;
  mockInstance.RABBITMQ_HOST = 'scalable-commerce-net';
  mockInstance.RABBITMQ_DEFAULT_USER = 'default';
  mockInstance.RABBITMQ_DEFAULT_PASS = '1234';
  mockInstance.JWT_SECRET = 'jwtsecret123';
  mockInstance.API_TAG = 'test_auth';
  mockInstance.MONGO_INITDB_ROOT_USERNAME = 'vhmendonca_test';
  mockInstance.MONGO_INITDB_ROOT_PASSWORD = '12345678';
  mockInstance.MONGO_DB_HOST = 'database-auth';

  let plainToInstanceMocked: jest.SpyInstance;
  let validateSyncMocked: jest.SpyInstance;

  beforeAll(() => {
    plainToInstanceMocked = jest.spyOn(classTransformer, 'plainToInstance');

    validateSyncMocked = jest.spyOn(classValidator, 'validateSync');
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
