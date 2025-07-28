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
      name: new NameVO(dto.name, false),
      password: new PasswordVO(dto.password, true, false, true),
      phonenumber: new PhoneNumberVO(dto.phonenumber, false),
      roles: defaultRoles,
      username: new UsernameVO(dto.username, false),
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: v4(),
    });
  }

  loginDTOForEntity(dto: LoginUserDTO): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, true, false, false),
      accessedAt: new Date(),
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
      name: new NameVO(json.name, false),
      password: new PasswordVO(json.password, true, false, false),
      phonenumber: new PhoneNumberVO(json.phonenumber, false),
      roles: json.roles,
      username: new UsernameVO(json.username, false),
      createdAt: new Date(),
      updatedAt: new Date(),
      _id: json._id,
    });
  }
}
