import { User } from '@user/domain/entities/user.entity';
import AvatarVO from '@user/domain/values-objects/user/avatar/avatar-vo';
import EmailVO from '@user/domain/values-objects/user/email/email-vo';
import NameVO from '@user/domain/values-objects/user/name/name-vo';
import PhoneNumberVO from '@user/domain/values-objects/user/phone-number/phone-number-vo';
import UsernameVO from '@user/domain/values-objects/user/username/username-vo';
import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { defaultRoles } from '@user/domain/types/permissions';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';
import { UserUpdate } from '@user/domain/entities/user-update.entity';
import IDVO from '@user/domain/values-objects/uuid/id-vo';
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
      avatar: user.avatar.getValue(),
      email: user.email.getValue(),
      name: user.name.getValue(),
      phonenumber: user.phonenumber.getValue(),
      updatedAt: user.updatedAt,
      userId: user.userId.getValue(),
      username: user.username.getValue(),
    };
  }

  userToJSON(user: User): UserEntity {
    return {
      _id: user._id,
      userId: user.userId.getValue(),
      name: user.name.getValue(),
      username: user.username.getValue(),
      email: user.email.getValue(),
      avatar: user.avatar?.getValue(),
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
