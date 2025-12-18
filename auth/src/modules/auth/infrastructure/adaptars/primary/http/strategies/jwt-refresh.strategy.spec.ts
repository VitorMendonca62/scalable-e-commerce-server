import { ConfigService } from '@nestjs/config';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { EnvironmentVariables } from '@config/environment/env.validation';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let configService: ConfigService<EnvironmentVariables>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockReturnValue('secret-test-key'),
    } as any;

    strategy = new JwtRefreshStrategy(configService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should validate payload and return userID', async () => {
    const payload = { sub: IDConstants.EXEMPLE, email: EmailConstants.EXEMPLE };

    const result = await strategy.validate(payload);

    expect(result).toEqual({ userID: IDConstants.EXEMPLE });
  });

  it('should throw WrongCredentials if payload is undefined or null ', async () => {
    await expect(strategy.validate(null)).rejects.toThrow(
      new WrongCredentials('Token inválido ou expirado'),
    );
  });

  it('should extract refresh token in cookies', () => {
    const extractFunction = (strategy as any)._jwtFromRequest;

    const mockRequest = {
      cookies: {
        refresh_token: 'Bearer token-value',
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
