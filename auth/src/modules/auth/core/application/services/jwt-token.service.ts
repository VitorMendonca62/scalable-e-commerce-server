import { BadRequestException, Injectable } from '@nestjs/common';
import { TokenServicePort } from '../ports/primary/session.port';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Permissions } from '../../domain/types/permissions';

interface IGenererateAccessToken {
  sub: string;
  email: string;
  roles: Permissions[];
  type: 'access';
}
interface IGenererateRefreshToken {
  sub: string;
  type: 'refresh';
}

@Injectable()
export class JwtTokenService implements TokenServicePort {
  private JWT_SECRET: string;

  constructor(private readonly configService: ConfigService) {
    this.JWT_SECRET = this.configService.get<string>('JWT_SECRET');
  }

  generateRefreshToken(playload: IGenererateRefreshToken): string {
    return jwt.sign(playload, this.JWT_SECRET, { expiresIn: '7D' });
  }

  generateAccessToken(playload: IGenererateAccessToken): string {
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
