import { Injectable } from '@nestjs/common';
import { WrongCredentials } from '@modules/user2/domain/ports/primary/http/error.port';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '@modules/user2/domain/ports/secondary/token-service.port';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(private readonly jwtService: JwtService) {}

  verifyToken(token: string): Record<string, any> {
    try {
      return this.jwtService.verify(token) as Record<string, any>;
    } catch (error) {
      throw new WrongCredentials('Token inválido ou expirado');
    }
  }
}
