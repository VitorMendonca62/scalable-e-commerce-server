import { BadRequestException, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { TokenService } from '@modules/auth/domain/ports/primary/session.port';
import { User } from '@modules/auth/domain/entities/user.entity';

@Injectable()
export class JwtTokenService implements TokenService {
  private JWT_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET');
  }

  generateRefreshToken(id: string): string {
    const playload = {
      sub: id,
      type: 'refresh' as const,
    };
    return jwt.sign(playload, this.JWT_SECRET, { expiresIn: '7D' });
  }

  generateAccessToken(user: User): string {
    const playload = {
      sub: user._id,
      email: user.email,
      roles: user.roles,
      type: 'access' as const,
    };
    return jwt.sign(playload, this.JWT_SECRET, { expiresIn: '1h' });
  }

  verifyToken(token: string): Record<string, any> {
    try {
      return jwt.verify(token, this.JWT_SECRET) as Record<string, any>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new BadRequestException('Token inválido ou expirado');
    }
  }
}
