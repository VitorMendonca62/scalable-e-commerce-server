import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { Injectable } from '@nestjs/common';
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { UserModel } from '../adaptars/secondary/database/models/user.model';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { defaultGoogleRoles } from '@auth/domain/constants/roles';
import {
  EmailVO,
  IDVO,
  PasswordVO,
  PasswordHashedVO,
} from '@auth/domain/values-objects';
import { CreateExternalUserDTO } from '../adaptars/primary/microservices/dtos/create-user.dto';

@Injectable()
export class UserMapper {
  constructor(private passwordHasher: PasswordHasher) {}
  loginDTOForEntity(
    dto: LoginUserDTO,
    ip: string,
    userAgent: string,
  ): UserLogin {
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(dto.password, false, this.passwordHasher),
      ip,
      userAgent,
    });
  }

  googleLoginDTOForEntity(
    dto: UserGoogleInCallBack,
    ip: string,
    userAgent: string,
  ): UserGoogleLogin {
    return new UserGoogleLogin({
      email: new EmailVO(dto.email),
      name: dto.username,
      id: dto.id,
      userAgent,
      ip,
    });
  }

  modelToEntity(json: UserModel): UserEntity {
    return new UserEntity({
      userID: new IDVO(json.userID),
      email: new EmailVO(json.email),
      password: new PasswordHashedVO(json.password, this.passwordHasher),
      roles: json.roles,
      accountProvider: json.accountProvider,
      accountProviderID: json.accountProviderID,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
      deletedAt: json.deletedAt,
    });
  }

  googleEntityForModel(user: UserGoogleLogin, userID: string): UserModel {
    return {
      userID,
      email: user.email.getValue(),
      password: undefined,
      roles: defaultGoogleRoles,
      accountProvider: AccountsProvider.GOOGLE,
      accountProviderID: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
  }

  externalUserForModel(user: CreateExternalUserDTO): UserModel {
    return {
      userID: user.userID,
      email: user.email,
      password: user.password,
      roles: user.roles,
      accountProvider: AccountsProvider.DEFAULT,
      accountProviderID: undefined,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      deletedAt: null,
    };
  }
}
