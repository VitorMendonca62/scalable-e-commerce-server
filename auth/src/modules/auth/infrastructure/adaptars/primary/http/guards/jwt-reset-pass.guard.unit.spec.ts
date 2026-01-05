import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { JWTResetPassGuard } from './jwt-reset-pass.guard';

describe('JWTResetPassGuard', () => {
  let guard: JWTResetPassGuard;

  beforeEach(() => {
    guard = new JWTResetPassGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return the user if authentication is successful', () => {
    const mockUser = { id: IDConstants.EXEMPLE, email: EmailConstants.EXEMPLE };

    const result = guard.handleRequest(null, mockUser);

    expect(result).toEqual(mockUser);
  });

  it('should throw WrongCredentials if user is null', () => {
    try {
      guard.handleRequest(null, null);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(WrongCredentials);
      expect(error.message).toBe(
        'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
      );
      expect(error.data).toBeUndefined();
    }
  });

  it('should throw WrongCredentials if user is false', () => {
    try {
      guard.handleRequest(null, false);
      fail('Should have thrown an error');
    } catch (error: any) {
      expect(error).toBeInstanceOf(WrongCredentials);
      expect(error.message).toBe(
        'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
      );
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
      expect(error.message).toBe(
        'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
      );
      expect(error.data).toBeUndefined();
    }
  });
});
