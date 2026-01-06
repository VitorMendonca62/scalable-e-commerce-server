import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { JWTResetPassTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { JwtPayloadValidator } from '@auth/infrastructure/validators/jwt-payload.validator';

@Injectable()
export class JwtResetPassStrategy extends PassportStrategy(
  Strategy,
  'jwt-reset-pass',
) {
  constructor(
    readonly configService: ConfigService<EnvironmentVariables>,
    readonly cookieService: CookieService,
  ) {
    super({
      jwtFromRequest: (req) =>
        cookieService.extractFromRequest(req, Cookies.ResetPassToken),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('RESET_PASS_SECRET'),
    });
  }

  validate(payload: JWTResetPassTokenPayLoad) {
    JwtPayloadValidator.validate(
      payload,
      'Sessão inválida. Realize o processo de recupeção de senha novamente.',
      'reset-pass',
    );

    return {
      email: payload.sub,
    };
  }
}
