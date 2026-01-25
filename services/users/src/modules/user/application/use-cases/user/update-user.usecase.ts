import { UserUpdateEntity } from '@modules/user/domain/entities/user-update.entity';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/constants';
import {
  ExecuteResult,
  UpdateUserPort,
} from '@modules/user/domain/ports/application/user/update-user.port';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

@Injectable()
export class UpdateUserUseCase implements UpdateUserPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async execute(
    userID: string,
    userUpdate: UserUpdateEntity,
  ): Promise<ExecuteResult> {
    if (userUpdate.username !== undefined) {
      const userExists = await this.userRepository.findOneWithOR(
        [
          {
            username: userUpdate.username.getValue(),
          },
        ],
        true,
      );
      if (userExists !== null && userExists !== undefined) {
        return {
          ok: false,
          message: UsernameConstants.ERROR_ALREADY_EXISTS,
          result: 'username',
          reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
        };
      }
    }

    const rowAffected = await this.userRepository.update(
      userID,
      this.userMapper.updateEntityForObject(userUpdate),
    );

    if (rowAffected === 0) {
      return {
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      };
    }

    return { ok: true };
  }
}
