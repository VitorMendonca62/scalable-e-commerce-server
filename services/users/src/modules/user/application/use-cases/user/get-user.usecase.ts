import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  GetUserPort,
} from '@modules/user/domain/ports/application/user/get-user.port';
import { Injectable } from '@nestjs/common';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';

@Injectable()
export class GetUserUseCase implements GetUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    identifier: string,
    field: 'username' | 'userID',
  ): Promise<ExecuteReturn> {
    const user = await this.userRepository.findOne({
      [field]: identifier,
    });

    if (user === null || user === undefined) {
      return {
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      };
    }

    if (user.deletedAt !== null) {
      return {
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      };
    }

    return {
      ok: true,
      result: {
        name: user.name,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
      },
    };
  }
}
