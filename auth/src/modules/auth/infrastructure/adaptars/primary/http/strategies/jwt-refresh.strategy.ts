import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { JWTRefreshTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly tokenRepository: TokenRepository,
  ) {
    super({
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['refresh_token'];
        }
        return token ? token.replace(/Bearer\s+/i, '') : null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_JWT_SECRET'),
    });
  }

  async validate(payload: JWTRefreshTokenPayLoad) {
    if (payload == undefined || payload == null) {
      throw new WrongCredentials('Sessão inválida. Faça login novamente.');
    }
    const isRevoked = await this.tokenRepository.isRevoked(payload.jti);

    if (isRevoked) {
      throw new WrongCredentials('Sessão inválida. Faça login novamente.');
    }

    return {
      userID: payload.sub,
      tokenID: payload.jti,
    };
  }
}
