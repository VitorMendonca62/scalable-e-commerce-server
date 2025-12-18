import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetAccessTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(userID: string): Promise<`Bearer ${string}`> {
    const user = await this.userRepository.findOne({ userID });

    if (user == undefined || user == null) {
      throw new WrongCredentials('Token inválido ou expirado');
    }

    return `Bearer ${this.tokenService.generateAccessToken(user)}`;
  }
}
