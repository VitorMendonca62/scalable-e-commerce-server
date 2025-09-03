import { User } from '@modules/user2/domain/entities/user.entity';
import AvatarVO from '@modules/user2/domain/values-objects/user/avatar/avatar-vo';
import EmailVO from '@modules/user2/domain/values-objects/user/email/email-vo';
import NameVO from '@modules/user2/domain/values-objects/user/name/name-vo';
import PhoneNumberVO from '@modules/user2/domain/values-objects/user/phone-number/phone-number-vo';
import UsernameVO from '@modules/user2/domain/values-objects/user/username/username-vo';
import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { defaultRoles } from '@modules/user2/domain/types/permissions';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';
import { UserUpdate } from '@modules/user2/domain/entities/user-update.entity';
import IDVO from '@modules/user2/domain/values-objects/uuid/id-vo';
import { UpdateUserDTO } from '../adaptars/primary/http/dtos/update-user.dto';
import { v7 } from 'uuid';

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO) {
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
      avatar: null,
      roles: defaultRoles,
      createdAt: dateNow,
      updatedAt: dateNow,
    });
  }

  updateDTOForEntity(dto: UpdateUserDTO, userId: string) {
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

  updateEntityForJSON(user: UserUpdate): Record<keyof UserUpdate, any> {
    return {
      avatar: `${user.avatar}`,
      email: `${user.email}`,
      name: `${user.name}`,
      phonenumber: `${user.phonenumber}`,
      updatedAt: user.updatedAt,
      userId: `${user.userId}`,
      username: `${user.username}`,
    };
  }

  userToJSON(user: User): UserEntity {
    return {
      _id: user._id,
      userId: `${user.userId}`,
      name: `${user.name}`,
      username: `${user.username}`,
      email: `${user.email}`,
      avatar: `${user.avatar}`,
      active: user.active,
      email_verified: user.email_verified,
      phone_verified: user.phone_verified,
      phonenumber: `${user.phonenumber}`,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
