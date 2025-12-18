import { ConfigService } from '@nestjs/config';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { JwtResetPassStrategy } from './jwt-reset-pass.strategy';

describe('JwtResetPassStrategy', () => {
  let strategy: JwtResetPassStrategy;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('secret-test-key'),
    } as any;

    strategy = new JwtResetPassStrategy(configService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should validate payload and return userID', async () => {
    const payload = {
      sub: EmailConstants.EXEMPLE,
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({ email: EmailConstants.EXEMPLE });
  });

  it('should throw WrongCredentials if payload is undefined or null ', async () => {
    await expect(strategy.validate(null)).rejects.toThrow(
      new WrongCredentials(
        'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
      ),
    );
  });

  it('should extract refresh token in cookies', () => {
    const extractFunction = (strategy as any)._jwtFromRequest;

    const mockRequest = {
      cookies: {
        reset_pass_token: 'Bearer token-value',
      },
    } as any;

    const token = extractFunction(mockRequest);

    expect(token).toBe('token-value');
  });

  it('should return null when extract failure refresh token in cookies ', () => {
    const extractFunction = (strategy as any)._jwtFromRequest;

    const mockRequest = {
      cookies: undefined,
    } as any;

    const token = extractFunction(mockRequest);

    expect(token).toBeNull();
  });
});
