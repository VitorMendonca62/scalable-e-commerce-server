import { JwtTokenService } from './jwt-token.service';
import { JwtService } from '@nestjs/jwt';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { ConfigService } from '@nestjs/config';
import { UserFactory } from '@user/infrastructure/helpers/users/factory';

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
    beforeEach(async () => {
      vi.spyOn(jwtService, 'sign').mockReturnValue(token);
      vi.spyOn(configService, 'get').mockReturnValue(resetPassKeyID);
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

      expect(configService.get).toHaveBeenCalledWith('SIGN_UP_KEYID');
      expect(jwtService.sign).toHaveBeenCalledWith(playload, {
        expiresIn: '10m',
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
