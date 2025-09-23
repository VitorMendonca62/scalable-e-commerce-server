import { User } from '@user/domain/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { defaultRoles } from '@user/domain/types/permissions';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';
import { UserUpdate } from '@user/domain/entities/user-update.entity';
import { UpdateUserDTO } from '../adaptars/primary/http/dtos/update-user.dto';
import { v7 } from 'uuid';
import IDVO from '@user/domain/values-objects/uuid/id-vo';
import {
  AvatarVO,
  EmailVO,
  NameVO,
  PhoneNumberVO,
  UsernameVO,
} from '@modules/user/domain/values-objects/user/values-object';

@Injectable()
export class UserMapper {
  createDTOForModel(dto: CreateUserDTO) {
    const dateNow = new Date();
    // TODO realizar pesquisa sobre a diferença de versões do uuid
    const userId = v7();

    return new User({
      userId: new IDVO(userId),
      name: new NameVO(dto.name, true),
      username: new UsernameVO(dto.username, true),
      email: new EmailVO(dto.email, true),
      phonenumber: new PhoneNumberVO(dto.phonenumber, true),
      active: true,
      email_verified: false,
      phone_verified: false,
      avatar: new AvatarVO(null, false),
      roles: defaultRoles,
      createdAt: dateNow,
      updatedAt: dateNow,
    });
  }

  updateDTOForModel(dto: UpdateUserDTO, userId: string) {
    return new UserUpdate({
      userId: new IDVO(userId),
      name: new NameVO(dto.name, false),
      username: new UsernameVO(dto.username, false),
      email: new EmailVO(dto.email, false),
      avatar: new AvatarVO(dto.avatar, false),
      phonenumber: new PhoneNumberVO(dto.phonenumber, false),
      updatedAt: new Date(),
    });
  }

  userUpdateModelForJSON(user: UserUpdate): Record<keyof UserUpdate, any> {
    return {
      avatar: user.avatar.getValue(),
      email: user.email.getValue(),
      name: user.name.getValue(),
      phonenumber: user.phonenumber.getValue(),
      updatedAt: user.updatedAt,
      userId: user.userId.getValue(),
      username: user.username.getValue(),
    };
  }

  userModelToJSON(user: User): UserEntity {
    return {
      _id: user._id,
      userId: user.userId.getValue(),
      name: user.name.getValue(),
      username: user.username.getValue(),
      email: user.email.getValue(),
      avatar: user.avatar.getValue(),
      active: user.active,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      phonenumber: user.phonenumber.getValue(),
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
