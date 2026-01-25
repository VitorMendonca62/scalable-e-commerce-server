import { UserEntity } from '@modules/user/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/user/create-user.dto';
import { UserUpdateEntity } from '@modules/user/domain/entities/user-update.entity';
import { UpdateUserDTO } from '../adaptars/primary/http/dtos/user/update-user.dto';
import {
  AvatarVO,
  EmailVO,
  NameVO,
  PhoneNumberVO,
  UsernameVO,
} from '@modules/user/domain/values-objects/user/values-object';
import { isNotEmpty } from 'class-validator';
import { defaultRoles } from '@modules/user/domain/constants/roles';
import UserModel from '../adaptars/secondary/database/models/user.model';
import { IDVO } from '@modules/user/domain/values-objects/common/value-object';

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO, email: string, userID: string) {
    const dateNow = new Date();

    return new UserEntity({
      userID: new IDVO(userID),
      name: new NameVO(dto.name),
      username: new UsernameVO(dto.username),
      email: new EmailVO(email),
      phoneNumber: new PhoneNumberVO(dto.phoneNumber),
      avatar: undefined,
      roles: defaultRoles,
      createdAt: dateNow,
      updatedAt: dateNow,
    });
  }

  updateDTOForModel(dto: UpdateUserDTO, userID: string): UserUpdateEntity {
    return new UserUpdateEntity({
      userID: new IDVO(userID),
      name: isNotEmpty(dto.name) ? new NameVO(dto.name) : undefined,
      username: isNotEmpty(dto.username)
        ? new UsernameVO(dto.username)
        : undefined,
      avatar: isNotEmpty(dto.avatar) ? new AvatarVO(dto.avatar) : undefined,
      phoneNumber: isNotEmpty(dto.phoneNumber)
        ? new PhoneNumberVO(dto.phoneNumber)
        : undefined,
      updatedAt: new Date(),
    });
  }

  updateEntityForObject(entity: UserUpdateEntity): Partial<UserModel> {
    return {
      userID: entity.userID.getValue(),
      name: isNotEmpty(entity.name) ? entity.name.getValue() : undefined,
      username: isNotEmpty(entity.username)
        ? entity.username.getValue()
        : undefined,
      avatar: isNotEmpty(entity.avatar) ? entity.avatar.getValue() : undefined,
      phoneNumber: isNotEmpty(entity.phoneNumber)
        ? entity.phoneNumber.getValue()
        : undefined,
      updatedAt: entity.updatedAt,
    };
  }

  entityToModel(user: UserEntity): Omit<UserModel, 'id'> {
    return {
      userID: user.userID.getValue(),
      name: user.name.getValue(),
      username: user.username.getValue(),
      email: user.email.getValue(),
      avatar: user.avatar?.getValue(),
      phoneNumber: user.phoneNumber?.getValue(),
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
