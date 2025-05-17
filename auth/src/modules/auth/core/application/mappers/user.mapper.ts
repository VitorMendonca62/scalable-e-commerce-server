import { Injectable } from '@nestjs/common';
import { CreateUserDTO } from '@modules/auth/adaptars/primary/http/dtos/create-user.dto';
import { User } from '@modules/auth/core/domain/entities/user.entity';
import { LoginUserDTO } from '@modules/auth/adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '@modules/auth/core/domain/entities/user-login.entity';
import { v4 } from 'uuid';
import { defaultRoles } from '../../domain/types/permissions';
import EmailVO from '../../domain/types/values-objects/email.vo';
import NameVO from '../../domain/types/values-objects/name.vo';
import PasswordVO from '../../domain/types/values-objects/password.vo';
import PhoneNumberVO from '../../domain/types/values-objects/phonenumber.vo';
import UsernameVO from '../../domain/types/values-objects/username.vo';

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
      createdAt: new Date('2025-02-16T17:21:05.370Z'),
      updatedAt: new Date('2025-02-16T17:21:05.370Z'),
      _id: v4(),
    });
  }

  loginDTOForEntity(dto: LoginUserDTO): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, true),
      accessedAt: new Date('2025-02-16T17:21:05.370Z'),
    });
  }
}
