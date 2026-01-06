import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { JWTRefreshTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { JwtPayloadValidator } from '@auth/infrastructure/validators/jwt-payload.validator';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    readonly configService: ConfigService<EnvironmentVariables>,
    private readonly tokenRepository: TokenRepository,
    readonly cookieService: CookieService,
  ) {
    super({
      jwtFromRequest: (request) =>
        cookieService.extractFromRequest(request, Cookies.RefreshToken),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_JWT_SECRET'),
    });
  }

  async validate(payload: JWTRefreshTokenPayLoad) {
    JwtPayloadValidator.validate(
      payload,
      'Sessão inválida. Faça login novamente.',
      'refresh',
    );

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
