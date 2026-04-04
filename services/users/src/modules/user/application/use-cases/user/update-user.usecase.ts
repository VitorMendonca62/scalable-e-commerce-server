import { UserUpdateEntity } from '@user/domain/entities/user-update.entity';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';
import { Injectable } from '@nestjs/common';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { UsernameConstants } from '@user/domain/values-objects/user/constants';
import {
  ExecuteResult,
  UpdateUserPort,
} from '@user/domain/ports/application/user/update-user.port';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';

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
    try {
      if (userUpdate.username !== undefined) {
        const userExists = await this.userRepository.findOneWithOR(
          [
            {
              username: userUpdate.username.getValue(),
            },
          ],
          true,
        );
        if (
          userExists !== null &&
          userExists !== undefined &&
          userExists.userID !== userID
        ) {
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel atualizar o usuário',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
