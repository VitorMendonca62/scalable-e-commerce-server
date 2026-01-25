import { JwtTokenService } from './jwt-token.service';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';

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

import * as fs from 'fs';
import * as path from 'path';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/factory';

describe('JwtTokenService', () => {
  let service: JwtTokenService;
  let jwtService: JwtService;

  let configService: ConfigService<EnvironmentVariables>;

  const token = 'T0K3n';
  const resetPassKeyID = 'SECRET';

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

  describe('generateSignUpToken', () => {
    const mockPrivateKey = 'mock-private-key-content';
    const mockPath = '/mock/path/to/sign-up-private.pem';

    beforeEach(async () => {
      vi.spyOn(jwtService, 'sign').mockReturnValue(token);
      vi.spyOn(configService, 'get').mockReturnValue(resetPassKeyID);
      vi.spyOn(path, 'join').mockReturnValue(mockPath);
      vi.spyOn(fs, 'readFileSync').mockReturnValue(mockPrivateKey);
    });

    const userModel = UserFactory.createModel();

    it('should call jwt sign function with correct parameters', async () => {
      const props = {
        email: userModel.email,
      };

      service.generateSignUpToken({ ...props });

      const playload = {
        sub: userModel.email,
        type: 'signup',
      };

      expect(path.join).toHaveBeenCalled();
      expect(fs.readFileSync).toHaveBeenCalledWith(mockPath);
      expect(configService.get).toHaveBeenCalledWith('SIGN_UP_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '10m',
        privateKey: mockPrivateKey,
        keyid: resetPassKeyID,
      });
    });

    it('should return token', async () => {
      const result = service.generateSignUpToken(userModel);

      expect(typeof result).toBe('string');
      expect(result).toBe(token);
    });
  });
});
