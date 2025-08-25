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

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO, userId: string) {
    return new User({
      userId,
      name: new NameVO(dto.name),
      username: new UsernameVO(dto.username),
      email: new EmailVO(dto.email),
      avatar: new AvatarVO(dto.avatar),
      phonenumber: new PhoneNumberVO(dto.phonenumber),
      active: true,
      email_verified: false,
      phone_verified: false,
      roles: defaultRoles,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  userToJSON(user: User): UserEntity {
    return {
      _id: user._id,
      user_id: user.user_id,
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
