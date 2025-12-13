import * as nestCommon from '@nestjs/common/decorators/http/create-route-param-metadata.decorator';
import { ExecutionContext } from '@nestjs/common';
import { createMockContext } from '@auth/infrastructure/helpers/tests/context-helper';

let capturedFactory: (data: unknown, context: ExecutionContext) => any;

jest.spyOn(nestCommon, 'createParamDecorator').mockImplementation((factory) => {
  capturedFactory = factory as any;
  return jest.fn();
});

import { AuthorizationToken } from './authorization-token.decorator';

describe('AuthorizationToken', () => {
  const mockToken = 'Bearer valid-token';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(AuthorizationToken).toBeDefined();
    expect(capturedFactory).toBeDefined();
  });

  it('should return the authorization header from request', () => {
    const result = capturedFactory(null, createMockContext(mockToken));

    expect(result).toBe(mockToken);
  });

  it('should return null if no have authorization in header', () => {
    const result = capturedFactory(null, createMockContext(null));

    expect(result).toBeNull();
  });
});
