import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { JWTResetPassTokenPayLoad } from '@auth/domain/types/jwt-tokens-payload';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';

@Injectable()
export class JwtResetPassStrategy extends PassportStrategy(
  Strategy,
  'jwt-reset-pass',
) {
  constructor(
    private configService: ConfigService<EnvironmentVariables>,
    private readonly cookieService: CookieService,
  ) {
    super({
      jwtFromRequest: (req) =>
        cookieService.extractFromRequest(req, Cookies.ResetPassToken),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('RESET_PASS_SECRET'),
    });
  }

  validate(payload: JWTResetPassTokenPayLoad) {
    if (payload === undefined || payload === null) {
      throw new WrongCredentials(
        'Sessão inválida. Realize o processo de recupeção de senha novamente.',
      );
    }
    return {
      email: payload.sub,
    };
  }
}
