import { AccountsProvider } from '@auth/domain/types/accounts-provider';
// Decorators
import { Injectable } from '@nestjs/common';

// DTO's
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';

// VO's
import EmailVO from '@auth/domain/values-objects/email/email-vo';
import IDVO from '@auth/domain/values-objects/id/id-vo';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import PhoneNumberVO from '@auth/domain/values-objects/phone-number/phone-number-vo';

// Entities
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';

// Models

import { UserModel } from '../adaptars/secondary/database/models/user.model';

// Dependeces
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { defaultGoogleRoles } from '@auth/domain/constants/roles';

// Function
@Injectable()
export class UserMapper {
  constructor(private passwordHasher: PasswordHasher) {}
  loginDTOForEntity(dto: LoginUserDTO, ip: string): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, false, this.passwordHasher),
      ip,
    });
  }

  googleLoginDTOForEntity(
    dto: UserGoogleInCallBack,
    ip: string,
  ): UserGoogleLogin {
    return new UserGoogleLogin({
      email: new EmailVO(dto.email),
      name: dto.username,
      id: dto.id,
      ip,
    });
  }

  jsonToUser(json: UserModel): UserEntity {
    return new UserEntity({
      userID: new IDVO(json.userID),
      email: new EmailVO(json.email),
      password: new PasswordHashedVO(json.password, this.passwordHasher),
      phoneNumber: new PhoneNumberVO(json.phoneNumber),
      roles: json.roles,
      accountProvider: json.accountProvider,
      accountProviderID: json.accountProviderID,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      active: json.active,
    });
  }

  googleUserCreateForJSON(user: UserGoogleLogin, userID: string): UserModel {
    return {
      userID,
      email: user.email.getValue(),
      password: undefined,
      phoneNumber: undefined,
      roles: defaultGoogleRoles,
      accountProvider: AccountsProvider.GOOGLE,
      accountProviderID: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      active: true,
    };
  }
}
