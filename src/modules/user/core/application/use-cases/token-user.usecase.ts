import { UserLogin } from '../../domain/user-login.entity';
import {  TokenUserOutbondPort, TokenUserPort } from '../ports/user.port';

export class TokenUserUseCase implements TokenUserPort {
  login(user: UserLogin): Promise<TokenUserOutbondPort> {
    throw new Error('Method not implemented.');
  }
  getAccessToken(refreshToken: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
