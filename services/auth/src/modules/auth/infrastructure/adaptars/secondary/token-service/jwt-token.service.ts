import { PermissionsSystem } from '@auth/domain/types/permissions';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { v7 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
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

  generateResetPassToken(props: { email: string }): string {
    const payload: Omit<JWTResetPassTokenPayLoad, 'iat' | 'exp'> = {
      sub: props.email,
      type: 'reset-pass' as const,
    };

    return this.jwtService.sign(payload, {
      expiresIn: '10m',
      privateKey: fs.readFileSync(
        path.join(__dirname, '../../../../../../../reset-pass-private.pem'),
      ),
      keyid: this.configService.get<string>('RESET_PASS_KEYID'),
    });
  }
}
