import { JwtTokenService } from './jwt-token.service';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-helper';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';

jest.mock('uuid', () => {
  return { __esModule: true, v7: jest.fn() };
});
import { v7 } from 'uuid';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;

  let configService: ConfigService<EnvironmentVariables>;

  const userId = 'userId';
  const token = 'T0K3n';
  const resetPassSecret = 'SECRET';

  beforeEach(async () => {
    jwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    } as any;

    configService = {
      get: jest.fn().mockReturnValue(resetPassSecret),
    } as any;

    service = new JwtTokenService(jwtService, configService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(configService).toBeDefined();
  });

  describe('generateRefreshToken', () => {
    beforeEach(async () => {
      (v7 as jest.Mock).mockReturnValue(IDConstants.EXEMPLE);

      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    });

    it('should call jwt sign function with correct parameters', async () => {
      service.generateRefreshToken(userId);

      const playload = {
        sub: userId,
        jti: IDConstants.EXEMPLE,
        type: 'refresh',
      };

      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '7D',
      });
    });

    it('should return token and tokenID', async () => {
      const result = service.generateRefreshToken(userId);

      expect(typeof result).toBe('object');
      expect(result).toEqual({
        refreshToken: token,
        tokenID: IDConstants.EXEMPLE,
      });
    });
  });

  describe('generateAccessToken', () => {
    beforeEach(async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    });

    const userJSON = mockUserLikeJSON();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userJSON.email,
        roles: userJSON.roles,
      };
      service.generateAccessToken({ ...props, userID: userJSON.userID });

      const playload = {
        ...props,
        sub: userJSON.userID,
        type: 'access',
      };

      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '1h',
      });
    });

    it('should return token', async () => {
      const result = service.generateAccessToken(userJSON);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('generateResetPassToken', () => {
    beforeEach(async () => {
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
    });

    const userJSON = mockUserLikeJSON();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userJSON.email,
      };

      service.generateResetPassToken({ ...props });

      const playload = {
        sub: userJSON.email,
        type: 'reset-pass',
      };

      expect(configService.get).toHaveBeenCalledWith('RESET_PASS_SECRET');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '10m',
        secret: resetPassSecret,
      });
    });

    it('should return token', async () => {
      const result = service.generateResetPassToken(userJSON);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });
});
