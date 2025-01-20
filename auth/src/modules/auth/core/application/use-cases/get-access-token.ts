import { GetAccessTokenPort } from '../ports/primary/session.port';
import { JwtTokenService } from '../services/jwt-token.service';

export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  execute(refreshToken: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
