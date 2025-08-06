import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { defaultRoles } from '../../domain/types/permissions';
import EmailVO from '../../domain/values-objects/email/email-vo';
import NameVO from '../../domain/values-objects/name/name-vo';
import PasswordVO from '../../domain/values-objects/password/password-vo';
import PhoneNumberVO from '../../domain/values-objects/phone-number/phone-number-vo';
import UsernameVO from '../../domain/values-objects/username/username-vo';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { User } from '@modules/auth/domain/entities/user.entity';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO): User {
    return new User({
      email: new EmailVO(dto.email),
      name: new NameVO(dto.name),
      password: new PasswordVO(dto.password, true, true),
      phonenumber: new PhoneNumberVO(dto.phonenumber),
      roles: defaultRoles,
      username: new UsernameVO(dto.username),
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: v4(),
    });
  }

  loginDTOForEntity(dto: LoginUserDTO): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, true, false),
    });
  }

  userToJSON(user: User): UserEntity {
    return {
      _id: user._id,
      name: `${user.name}`,
      username: `${user.username}`,
      email: `${user.email}`,
      password: `${user.password}`,
      phonenumber: `${user.phonenumber}`,
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  jsonToUser(json: UserEntity): User {
    return new User({
      email: new EmailVO(json.email),
      name: new NameVO(json.name),
      password: new PasswordVO(json.password, true, false),
      phonenumber: new PhoneNumberVO(json.phonenumber),
      roles: json.roles,
      username: new UsernameVO(json.username),
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: json._id,
    });
  }
}
