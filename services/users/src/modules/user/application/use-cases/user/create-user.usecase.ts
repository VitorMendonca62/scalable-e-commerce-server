import { Injectable } from '@nestjs/common';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';
import { UserEntity } from '@user/domain/entities/user.entity';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import {
  EmailConstants,
  UsernameConstants,
} from '@user/domain/values-objects/user/constants';
import {
  CreateUserPort,
  ExecuteReturn,
} from '@user/domain/ports/application/user/create-user.port';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';
import { PasswordHasher } from '@user/domain/ports/secondary/password-hasher.port';

@Injectable()
export class CreateUserUseCase implements CreateUserPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(user: UserEntity, password: string): Promise<ExecuteReturn> {
    try {
      const userExists = await this.userRepository.findOneWithOR(
        [
          {
            username: user.username.getValue(),
          },
          {
            email: user.email.getValue(),
          },
        ],
        true,
      );

      if (userExists !== null && userExists !== undefined) {
        if (user.email.getValue() === userExists.email) {
          return {
            ok: false,
            message: EmailConstants.ERROR_ALREADY_EXISTS,
            result: 'email',
            reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
          };
        }

        return {
          ok: false,
          message: UsernameConstants.ERROR_ALREADY_EXISTS,
          result: 'username',
          reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
        };
      }

      const userModel = this.userMapper.entityToModel(user);
      await this.userRepository.create(userModel);

      return {
        ok: true,
        result: {
          roles: userModel.roles,
          createdAt: userModel.createdAt,
          updatedAt: userModel.updatedAt,
          password: this.passwordHasher.hash(password),
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel criar o usuário',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
