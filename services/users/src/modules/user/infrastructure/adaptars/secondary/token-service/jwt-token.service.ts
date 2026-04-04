import { EnvironmentVariables } from '@config/environment/env.validation';
import { TokenService } from '@user/domain/ports/secondary/token-service.port';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  generateSignUpToken(props: { email: string }): string {
    const payload: Omit<JWTSignUpTokenPayLoad, 'iat' | 'exp'> = {
      sub: props.email,
      type: 'signup' as const,
    };

    //  TODO VERIFICAR ESSE ANY
    return this.jwtService.sign(payload as any, {
      expiresIn: '10m',
      keyid: this.configService.get<string>('SIGN_UP_KEYID'),
    });
  }
}
