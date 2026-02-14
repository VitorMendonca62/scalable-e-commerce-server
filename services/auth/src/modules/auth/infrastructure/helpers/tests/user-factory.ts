import { defaultRoles } from '@auth/domain/constants/roles';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { EmailVO, IDVO, PasswordVO } from '@auth/domain/values-objects';
import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { LoginUserDTO } from '@auth/infrastructure/adaptars/primary/http/dtos/login-user.dto';
import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';
import BcryptPasswordHasher from '@auth/infrastructure/adaptars/secondary/password-hasher/bcrypt-password-hasher';
import { PasswordHasherFactory } from './password-factory';

export class UserFactory {
  static createEntity(overrides: Partial<UserEntity> = {}): UserEntity {
    return new UserEntity({
      userID: new IDVO(IDConstants.EXEMPLE),
      email: new EmailVO(EmailConstants.EXEMPLE),
      accountProvider: AccountsProvider.DEFAULT,
      accountProviderID: null,
      roles: defaultRoles,
      password: new PasswordVO(
        PasswordConstants.EXEMPLE,
        false,
        new BcryptPasswordHasher(),
      ),
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: new Date(),
      ...overrides,
    });
  }

  static createModel(
    overrides: Partial<UserModel> = {},
  ): Omit<UserModel, 'id'> {
    return {
      userID: IDConstants.EXEMPLE,
      email: EmailConstants.EXEMPLE,
      password: PasswordConstants.EXEMPLE,
      accountProvider: AccountsProvider.DEFAULT,
      accountProviderID: null,
      roles: defaultRoles,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }
}

export class LoginUserFactory {
  static createDTO(overrides: Partial<LoginUserDTO> = {}): LoginUserDTO {
    return {
      email: EmailConstants.EXEMPLE,
      password: PasswordConstants.EXEMPLE,
      ...overrides,
    };
  }

  static createDTOLikeInstance(
    overrides: Partial<LoginUserDTO> = {},
  ): LoginUserDTO {
    const dto = new LoginUserDTO();
    const keys = Object.keys(overrides);

    dto.email = keys.includes('email')
      ? overrides.email
      : EmailConstants.EXEMPLE;
    dto.password = keys.includes('password')
      ? overrides.password
      : PasswordConstants.EXEMPLE;
    return dto;
  }

  static createEntity(overrides: Partial<LoginUserDTO> = {}): UserLogin {
    const dto = this.createDTO(overrides);
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(
        dto.password,
        false,
        new PasswordHasherFactory().default(),
      ),
      ip: '122.0.0.0',
      userAgent: 'agent',
    });
  }
}

export class GoogleUserFactory {
  static createUserInCallbBack(
    overrides: Partial<UserGoogleInCallBack> = {},
  ): UserGoogleInCallBack {
    return {
      email: EmailConstants.EXEMPLE,
      id: IDConstants.EXEMPLE,
      name: 'test',
      username: 'test',
      ...overrides,
    };
  }

  static createEntity(
    overrides: Partial<UserGoogleLogin> = {},
  ): UserGoogleLogin {
    return {
      email: new EmailVO(EmailConstants.EXEMPLE),
      id: IDConstants.EXEMPLE,
      name: 'test',
      ip: '122.0.0.0',
      userAgent: 'agent',
      ...overrides,
    };
  }
}
