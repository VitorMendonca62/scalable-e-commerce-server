import { Injectable } from '@nestjs/common';
import { v4 } from 'uuid';
import { defaultRoles } from '../../domain/types/permissions';
import EmailVO from '../../domain/values-objects/email.vo';
import NameVO from '../../domain/values-objects/name.vo';
import PasswordVO from '../../domain/values-objects/password.vo';
import PhoneNumberVO from '../../domain/values-objects/phonenumber.vo';
import UsernameVO from '../../domain/values-objects/username.vo';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { User } from '@modules/auth/domain/entities/user.entity';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';
import {
  FieldInvalid,
  HttpFieldInvalid,
} from '@modules/auth/domain/types/errors/errors';

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO): User {
    try {
      return new User({
        email: new EmailVO(dto.email),
        name: new NameVO(dto.name, false),
        password: new PasswordVO(dto.password, true),
        phonenumber: new PhoneNumberVO(dto.phonenumber, false),
        roles: defaultRoles,
        username: new UsernameVO(dto.username, false),
        createdAt: new Date(),
        updatedAt: new Date(),
        _id: v4(),
      });
    } catch (error) {
      throw new HttpFieldInvalid(error.message, (error as FieldInvalid).data);
    }
  }

  userToJSON(user: User) {
    return {
      name: user.name.getValue(),
      username: user.username.getValue(),
      email: user.email.getValue(),
      password: user.password.getValue(),
      phonenumber: user.phonenumber.getValue(),
      roles: user.roles,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  loginDTOForEntity(dto: LoginUserDTO): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, true),
      accessedAt: new Date(),
    });
  }
}
