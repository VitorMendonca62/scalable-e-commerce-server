import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import {
  DeleteUserPort,
  ExecuteResult,
} from '@modules/user/domain/ports/application/user/delete-user.port';
import { Injectable } from '@nestjs/common';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';

@Injectable()
export class DeleteUserUseCase implements DeleteUserPort {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userID: string): Promise<ExecuteResult> {
    const rowAffected = await this.userRepository.delete(userID);

    if (rowAffected == 0) {
      return {
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      };
    }

    return {
      ok: true,
    };
  }
}
