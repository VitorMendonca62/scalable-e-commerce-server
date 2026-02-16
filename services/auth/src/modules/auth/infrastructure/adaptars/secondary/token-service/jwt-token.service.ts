import { PermissionsSystem } from '@auth/domain/types/permissions';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { v7 } from 'uuid';
@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    @Inject('RESET_PASS_PRIVATE_KEY')
    private readonly resetPassPrivateKey: string,
  ) {}

  generateRefreshToken(id: string): { refreshToken: string; tokenID: string } {
    const jti = v7();

    const payload: Omit<JWTRefreshTokenPayLoad, 'iat' | 'exp'> = {
      sub: id,
      jti,
      type: 'refresh' as const,
    };
    return {
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: '7D',
        keyid: this.configService.get('AUTH_JWT_KEYID'),
      }),
      tokenID: jti,
    };
  }

  generateAccessToken(props: {
    userID: string;
    email: string;
    roles: PermissionsSystem[];
  }): string {
    const payload: Omit<JWTAccessTokenPayLoad, 'iat' | 'exp'> = {
      sub: props.userID,
      email: props.email,
      roles: props.roles,
      type: 'access' as const,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '1h',
      keyid: this.configService.get('AUTH_JWT_KEYID'),
    });
  }

  async generateResetPassToken(props: { email: string }): Promise<string> {
    const payload: Omit<JWTResetPassTokenPayLoad, 'iat' | 'exp'> = {
      sub: props.email,
      type: 'reset-pass' as const,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '10m',
      privateKey: this.resetPassPrivateKey,
      keyid: this.configService.get<string>('RESET_PASS_KEYID'),
    });
  }
}
