import { PermissionsSystem } from '@auth/domain/types/permissions';
import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { v7 } from 'uuid';
import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';
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
        expiresIn: TokenExpirationConstants.REFRESH_TOKEN_SECONDS,
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
      expiresIn: TokenExpirationConstants.ACCESS_TOKEN_SECONDS,
      keyid: this.configService.get('AUTH_JWT_KEYID'),
    });
  }

  async generateResetPassToken(props: { email: string }): Promise<string> {
    const payload: Omit<JWTResetPassTokenPayLoad, 'iat' | 'exp'> = {
      sub: props.email,
      type: 'reset-pass' as const,
    };

    return this.jwtService.sign(payload, {
      expiresIn: TokenExpirationConstants.RESET_PASS_TOKEN_SECONDS,
      privateKey: this.resetPassPrivateKey,
      keyid: this.configService.get<string>('RESET_PASS_KEYID'),
    });
  }
}
