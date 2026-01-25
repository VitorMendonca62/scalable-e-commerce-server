import { EnvironmentVariables } from '@config/environment/env.validation';
import { TokenService } from '@modules/user/domain/ports/secondary/token-service.port';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { JwtService } from '@nestjs/jwt';
import * as path from 'path';
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
      privateKey: fs.readFileSync(
        path.join(process.cwd(), `certs/sign-up-private.pem`),
      ),
      keyid: this.configService.get<string>('SIGN_UP_KEYID'),
    });
  }
}
