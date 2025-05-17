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

@Injectable()
export class UserMapper {
  createDTOForEntity(dto: CreateUserDTO): User {
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
  }

  loginDTOForEntity(dto: LoginUserDTO): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, true),
      accessedAt: new Date(),
    });
  }
}
