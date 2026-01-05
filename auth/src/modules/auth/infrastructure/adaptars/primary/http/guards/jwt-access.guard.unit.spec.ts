import { JWTAccessGuard } from './jwt-access.guard';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { UserInAcessToken } from '@auth/domain/types/user';

describe('JWTAccessGuard', () => {
  let guard: JWTAccessGuard;

  beforeEach(() => {
    guard = new JWTAccessGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return the user if authentication is successful', () => {
    const mockUser: UserInAcessToken = {
      userID: IDConstants.EXEMPLE,
    };

    const result = guard.handleRequest(null, mockUser);

    expect(result).toEqual(mockUser);
  });

  it('should throw WrongCredentials if user is null', () => {
    try {
      guard.handleRequest(null, null);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(WrongCredentials);
      expect(error.message).toBe('Token inválido ou expirado');
      expect(error.data).toBeUndefined();
    }
  });

  it('should throw WrongCredentials if user is false', () => {
    try {
      guard.handleRequest(null, false);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(WrongCredentials);
      expect(error.message).toBe('Token inválido ou expirado');
      expect(error.data).toBeUndefined();
    }
  });

  it('should throw the specific error if an error object is provided', () => {
    const customError = new Error('Database connection failed');

    try {
      guard.handleRequest(customError, null);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Database connection failed');
      expect(error.data).toBeUndefined();
    }
  });

  it('should throw WrongCredentials if user is undefined', () => {
    try {
      guard.handleRequest(null, undefined);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(WrongCredentials);
      expect(error.message).toBe('Token inválido ou expirado');
      expect(error.data).toBeUndefined();
    }
  });
});
