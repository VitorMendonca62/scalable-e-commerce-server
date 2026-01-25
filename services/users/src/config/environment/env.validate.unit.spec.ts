import { EnvironmentVariables, NodeEnv } from './env.validation';
import { type Mock } from 'vitest';

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
  };

  const mockInstance = new EnvironmentVariables();
  mockInstance.NODE_ENV = NodeEnv.Development;
  mockInstance.HOST = 'localhost';
  mockInstance.PORT = 8080;
  mockInstance.RABBITMQ_HOST = 'scalable-commerce-net';
  mockInstance.RABBITMQ_DEFAULT_USER = 'default';
  mockInstance.RABBITMQ_DEFAULT_PASS = '1234';

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
