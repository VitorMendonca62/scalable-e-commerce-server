import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JWTAccessTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly cookieService: CookieService,
  ) {
    super({
      jwtFromRequest: (request) =>
        cookieService.extractFromRequest(request, Cookies.AccessToken),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_JWT_SECRET'),
    });
  }

  validate(payload: JWTAccessTokenPayLoad) {
    if (payload === undefined || payload === null) {
      throw new WrongCredentials('Token inválido ou expirado');
    }

    return {
      userID: payload.sub,
    };
  }
}
