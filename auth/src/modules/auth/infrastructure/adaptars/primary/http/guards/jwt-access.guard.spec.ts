import { JWTAccessGuard } from './jwt-access.guard';
import { ExecutionContext } from '@nestjs/common';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';

describe('JWTAccessGuard', () => {
  let guard: JWTAccessGuard;

  beforeEach(() => {
    guard = new JWTAccessGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return the user if authentication is successful', () => {
    const mockUser = { id: IDConstants.EXEMPLE, email: EmailConstants.EXEMPLE };

    // handleRequest(err, user, info, context)
    const result = guard.handleRequest(
      null,
      mockUser,
      null,
      {} as ExecutionContext,
    );

    expect(result).toEqual(mockUser);
  });

  it('should throw WrongCredentials if user is null', () => {
    expect(() => {
      guard.handleRequest(null, null, null, {} as ExecutionContext);
    }).toThrow(new WrongCredentials('Token inválido ou expirado'));
  });

  it('should throw WrongCredentials if user is false', () => {
    expect(() => {
      guard.handleRequest(null, false, null, {} as ExecutionContext);
    }).toThrow(new WrongCredentials('Token inválido ou expirado'));
  });

  it('should throw the specific error if an error object is provided', () => {
    const customError = new Error('Database connection failed');

    expect(() => {
      guard.handleRequest(customError, null, null, {} as ExecutionContext);
    }).toThrow(new Error('Database connection failed'));
  });

  it('should throw WrongCredentials if user is undefined', () => {
    expect(() => {
      guard.handleRequest(null, undefined, null, {} as ExecutionContext);
    }).toThrow(new WrongCredentials('Token inválido ou expirado'));
  });
});
