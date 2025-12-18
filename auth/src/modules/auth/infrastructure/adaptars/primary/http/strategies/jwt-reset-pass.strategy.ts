import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
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
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('RESET_PASS_SECRET'),
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new WrongCredentials('Token inválido ou expirado');
    }

    return {
      email: payload.email,
    };
  }
}
