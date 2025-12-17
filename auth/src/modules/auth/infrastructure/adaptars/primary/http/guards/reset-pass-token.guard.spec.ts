import { createMockContext } from '@auth/infrastructure/helpers/tests/context-helper';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { ResetPassTokenGuard } from './reset-pass-token.guard';

describe('ResetPassTokenGuard', () => {
  let guard: ResetPassTokenGuard;

  let tokenService: TokenService;

  const token = 'token';
  const bearerToken = `Bearer ${token}`;

  beforeEach(() => {
    tokenService = {
      verifyResetPassToken: jest.fn(),
    } as any;
    guard = new ResetPassTokenGuard(tokenService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(tokenService).toBeDefined();
  });

  describe('canActivate', () => {
    beforeEach(() => {
      jest
        .spyOn(tokenService, 'verifyResetPassToken')
        .mockReturnValue({ sub: 123 });
    });

    it('should call verify token function with correct parameters', () => {
      guard.canActivate(createMockContext(bearerToken));

      expect(tokenService.verifyResetPassToken).toHaveBeenCalledWith(token);
    });

    it('should return true on sucess', () => {
      const result = guard.canActivate(createMockContext(bearerToken));

      expect(result).toBe(true);
    });

    it('should throw WrongCredentials if authorization is undefined', () => {
      expect(() => guard.canActivate(createMockContext(undefined))).toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });

    it('should throw WrongCredentials if authorization is null', () => {
      expect(() => guard.canActivate(createMockContext(null))).toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });

    it('should throw WrongCredentials if authorization not is Bearer token', () => {
      expect(() => guard.canActivate(createMockContext('token'))).toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });

    it('should throw error if tokenService.verifyResetPassToken throw any error', () => {
      jest
        .spyOn(tokenService, 'verifyResetPassToken')
        .mockImplementation(() => {
          throw new Error('Error verifying token');
        });

      expect(() => guard.canActivate(createMockContext(bearerToken))).toThrow(
        new Error('Error verifying token'),
      );
    });
  });
});
