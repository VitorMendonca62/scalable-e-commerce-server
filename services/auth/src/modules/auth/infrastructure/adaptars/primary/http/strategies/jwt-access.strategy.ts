import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { JWTAccessTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { JwtPayloadValidator } from '@auth/infrastructure/validators/jwt-payload.validator';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    readonly configService: ConfigService<EnvironmentVariables>,
    readonly cookieService: CookieService,
  ) {
    super({
      jwtFromRequest: (request) =>
        cookieService.extractFromRequest(request, Cookies.AccessToken),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('AUTH_JWT_SECRET'),
    });
  }

  validate(payload: JWTAccessTokenPayLoad) {
    JwtPayloadValidator.validate(
      payload,
      'Token inválido ou expirado',
      'access',
    );

    return {
      userID: payload.sub,
    };
  }
}
