import { Injectable } from '@nestjs/common';
import { TokenServicePort } from '../ports/primary/session.port';
import jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  private JWT_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET');
  }

  generateToken(playload: Record<string, any>, expiresIn: string): string {
    return jwt.sign(playload, this.JWT_SECRET, { expiresIn });
  }

  verifyToken(token: string): Record<string, any> {
    try {
      return jwt.verify(token, this.JWT_SECRET) as Record<string, any>;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      throw new Error('Token inválido');
    }
  }
}
