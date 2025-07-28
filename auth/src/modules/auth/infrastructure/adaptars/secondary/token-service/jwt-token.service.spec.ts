import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/config/environment/env.validation';
import { JwtTokenService } from './jwt-token.service';
import * as jwt from 'jsonwebtoken';
import { userLikeJSON } from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { WrongCredentials } from '@modules/auth/domain/ports/primary/http/errors.port';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let configService: ConfigService<EnvironmentVariables>;

  let jwtSignMock: jest.SpyInstance;
  let jwtVerifyMock: jest.SpyInstance;

  const userId = 'userId';
  const secret = 'SECRET';
  const token = 'T0K3n';

  beforeAll(() => {
    configService = {
      get: jest.fn().mockReturnValue(secret),
    } as any;

    jwtSignMock = jest.spyOn(jwt, 'sign');
    jwtSignMock.mockReturnValue(token);

    jwtVerifyMock = jest.spyOn(jwt, 'verify');
    jwtVerifyMock.mockReturnValue({ sub: userId });
  });

  beforeEach(async () => {
    service = new JwtTokenService(configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('generateRefreshToken', () => {
    it('should call jwt sign function with correct parameters', async () => {
      service.generateRefreshToken(userId);

      const playload = {
        sub: userId,
        type: 'refresh',
      };

      expect(jwtSignMock).toHaveBeenCalledWith(playload, secret, {
        expiresIn: '7D',
      });
    });

    it('should return token', async () => {
      const result = service.generateRefreshToken(userId);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('generateRefreshToken', () => {
    const user = userLikeJSON();

    it('should call jwt sign function with correct parameters', async () => {
      service.generateAccessToken(user);

      const playload = {
        sub: user._id,
        email: user.email,
        roles: user.roles,
        type: 'access',
      };

      expect(jwtSignMock).toHaveBeenCalledWith(playload, secret, {
        expiresIn: '1h',
      });
    });

    it('should return token', async () => {
      const result = service.generateAccessToken(user);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('verifyToken', () => {
    it('should call jwt verify function with correct parameters', async () => {
      service.verifyToken(token);

      expect(jwtVerifyMock).toHaveBeenCalledWith(token, secret);
    });

    it('should return playload', async () => {
      const result = service.verifyToken(token);

      expect(typeof result).toBe('object');
      expect(result).toEqual({ sub: userId });
    });

    it('should return playload', async () => {
      jwtVerifyMock.mockImplementation(() => {
        throw new Error('Error in verify token');
      });

      expect(() => service.verifyToken(token)).toThrow(
        new WrongCredentials('Token inválido ou expirado'),
      );
    });
  });
});
