import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { Permissions } from '@auth/domain/types/permissions';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { v7 } from 'uuid';
import {
  JWTAccessTokenPayLoad,
  JWTRefreshTokenPayLoad,
  JWTResetPassTokenPayLoad,
} from '@auth/domain/types/jwt-tokens-payload';

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
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7D' }),
      tokenID: jti,
    };
  }

  generateAccessToken(props: {
    userID: string;
    email: string;
    roles: Permissions[];
  }): string {
    const payload: Omit<JWTAccessTokenPayLoad, 'iat' | 'exp'> = {
      sub: props.userID,
      email: props.email,
      roles: props.roles,
      type: 'access' as const,
    };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  generateResetPassToken(props: { email: string }): string {
    const payload: Omit<JWTResetPassTokenPayLoad, 'iat' | 'exp'> = {
      sub: props.email,
      type: 'reset-pass' as const,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '10m',
      secret: this.configService.get<string>('RESET_PASS_SECRET'),
    });
  }
}
