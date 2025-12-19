import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';

@Injectable()
export class JwtResetPassStrategy extends PassportStrategy(
  Strategy,
  'jwt-reset-pass',
) {
  constructor(private configService: ConfigService<EnvironmentVariables>) {
    super({
      jwtFromRequest: (req) => {
        let token = null;
        if (req && req.cookies) {
          token = req.cookies['reset_pass_token'];
        }
        return token ? token.replace(/Bearer\s+/i, '') : null;
      },
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('RESET_PASS_SECRET'),
    });
  }

  async validate(payload: any) {
    if (payload == undefined || payload == null) {
      throw new WrongCredentials(
        'Sessão inválida. Realize o processo de recupeção de senha novamente.',
      );
    }
    return {
      email: payload.sub,
    };
  }
}
