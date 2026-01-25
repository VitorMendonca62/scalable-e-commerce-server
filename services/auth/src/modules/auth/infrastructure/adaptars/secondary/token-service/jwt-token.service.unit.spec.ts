import { JwtTokenService } from './jwt-token.service';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';
import { type Mock } from 'vitest';

vi.mock('uuid', () => {
  return { v7: vi.fn() };
});

vi.mock('fs', () => {
  return {
    readFileSync: vi.fn(),
  };
});

vi.mock('path', () => {
  return {
    join: vi.fn(),
  };
});

import { v7 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import IDConstants from '@auth/domain/values-objects/id/id-constants';
import { UserFactory } from '@auth/infrastructure/helpers/tests/user-factory';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;

  let configService: ConfigService<EnvironmentVariables>;

  const userId = 'userId';
  const token = 'T0K3n';
  const resetPassKeyID = 'SECRET';
  const authKeyID = 'SECRET';

  beforeEach(async () => {
    jwtService = {
      sign: vi.fn(),
      verify: vi.fn(),
    } as any;

    configService = {
      get: vi.fn(),
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
      (v7 as Mock).mockReturnValue(IDConstants.EXEMPLE);

      vi.spyOn(jwtService, 'sign').mockReturnValue(token);
      vi.spyOn(configService, 'get').mockReturnValue(authKeyID);
    });

    it('should call jwt sign function with correct parameters', async () => {
      service.generateRefreshToken(userId);

      const playload = {
        sub: userId,
        jti: IDConstants.EXEMPLE,
        type: 'refresh',
      };

      expect(configService.get).toHaveBeenCalledWith('AUTH_JWT_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '7D',
        keyid: authKeyID,
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
      vi.spyOn(jwtService, 'sign').mockReturnValue(token);
      vi.spyOn(configService, 'get').mockReturnValue(authKeyID);
    });

    const userModel = new UserFactory().likeModel();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userModel.email,
        roles: userModel.roles,
      };
      service.generateAccessToken({ ...props, userID: userModel.userID });

      const playload = {
        ...props,
        sub: userModel.userID,
        type: 'access',
      };

      expect(configService.get).toHaveBeenCalledWith('AUTH_JWT_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '1h',
        keyid: authKeyID,
      });
    });

    it('should return token', async () => {
      const result = service.generateAccessToken(userModel);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });

  describe('generateResetPassToken', () => {
    const mockPrivateKey = 'mock-private-key-content';
    const mockPath = '/mock/path/to/reset-pass-private.pem';

    beforeEach(async () => {
      vi.spyOn(jwtService, 'sign').mockReturnValue(token);
      vi.spyOn(configService, 'get').mockReturnValue(resetPassKeyID);
      vi.spyOn(path, 'join').mockReturnValue(mockPath);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(mockPrivateKey);
    });

    const userModel = new UserFactory().likeModel();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userModel.email,
      };

      service.generateResetPassToken({ ...props });

      const playload = {
        sub: userModel.email,
        type: 'reset-pass',
      };

      expect(path.join).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith(mockPath);
      expect(configService.get).toHaveBeenCalledWith('RESET_PASS_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '10m',
        privateKey: mockPrivateKey,
        keyid: resetPassKeyID,
      });
    });

    it('should return token', async () => {
      const result = service.generateResetPassToken(userModel);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });
});
