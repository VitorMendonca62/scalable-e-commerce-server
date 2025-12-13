import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { Permissions } from '@auth/domain/types/permissions';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

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

  verifyToken(token: string): Record<string, any> {
    try {
      return this.jwtService.verify(token) as Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new WrongCredentials('Token inválido ou expirado');
    }
  }
}
