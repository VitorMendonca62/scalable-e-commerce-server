import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { Permissions } from '@auth/domain/types/permissions';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  generateRefreshToken(id: string): string {
    const payload = {
      sub: id,
      type: 'refresh' as const,
    };
    return this.jwtService.sign(payload, { expiresIn: '7D' });
  }

  generateAccessToken(props: {
    userID: string;
    email: string;
    roles: Permissions[];
  }): string {
    const payload = {
      sub: props.userID,
      email: props.email,
      roles: props.roles,
      type: 'access' as const,
    };
    return this.jwtService.sign(payload, { expiresIn: '1h' });
  }

  generateResetPassToken(props: { email: string }): string {
    const payload = {
      sub: props.email,
      type: 'reset-pass' as const,
    };
    return this.jwtService.sign(payload, {
      expiresIn: '10m',
      secret: this.configService.get<string>('RESET_PASS_SECRET'),
    });
  }

  verifyResetPassToken(token: string): Record<string, any> {
    try {
      return this.jwtService.verify(token) as Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new WrongCredentials(
        'Token de recuperação de senha inválido ou expirado. Realize o processo novamente.',
      );
    }
  }

  verifyToken(token: string): Record<string, any> {
    try {
      return this.jwtService.verify(token) as Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new WrongCredentials('Token inválido ou expirado');
    }
  }
}
