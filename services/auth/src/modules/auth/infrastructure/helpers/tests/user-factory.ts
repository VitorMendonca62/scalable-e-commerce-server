import { defaultRoles, defaultGoogleRoles } from '@auth/domain/constants/roles';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import {
  EmailVO,
  IDVO,
  PasswordHashedVO,
  PasswordVO,
} from '@auth/domain/values-objects';
import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
  PasswordHashedConstants,
} from '@auth/domain/values-objects/constants';
import { LoginUserDTO } from '@auth/infrastructure/adaptars/primary/http/dtos/login-user.dto';
import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';
import { PasswordHasherFactory } from './password-factory';

export class UserFactory {
  likeModel(overrides: Partial<UserModel> = {}): UserModel {
    return {
      userID: IDConstants.EXEMPLE,
      email: EmailConstants.EXEMPLE,
      password: PasswordHashedConstants.EXEMPLE,
      roles: defaultRoles,
      createdAt: new Date('2025-02-16T17:21:05.370Z'),
      updatedAt: new Date('2025-02-16T17:21:05.370Z'),
      accountProvider: AccountsProvider.DEFAULT,
      accountProviderID: undefined,
      active: true,
      ...overrides,
    };
  }

  likeEntity(overrides: Partial<UserModel> = {}) {
    const userModel = this.likeModel(overrides);

    return new UserEntity({
      userID: new IDVO(userModel.userID),
      email: new EmailVO(userModel.email),
      password: new PasswordHashedVO(
        userModel.password,
        new PasswordHasherFactory().default(),
      ),
      roles: defaultRoles,
      createdAt: new Date('2025-02-16T17:21:05.370Z'),
      updatedAt: new Date('2025-02-16T17:21:05.370Z'),
      accountProvider: AccountsProvider.DEFAULT,
      accountProviderID: undefined,
      active: true,
    });
  }
}
export class LoginUserFactory {
  likeDTO(overrides: Partial<LoginUserDTO> = {}): LoginUserDTO {
    return {
      email: EmailConstants.EXEMPLE,
      password: PasswordConstants.EXEMPLE,
      ...overrides,
    };
  }

  likeDTOLikeInstance(overrides: Partial<LoginUserDTO> = {}): LoginUserDTO {
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

  likeEntity(overrides: Partial<LoginUserDTO> = {}): UserLogin {
    const dto = this.likeDTO(overrides);
    return new UserLogin({
      email: new EmailVO(dto.email),
      password: new PasswordVO(
        dto.password,
        false,
        new PasswordHasherFactory().default(),
      ),
      ip: '122.0.0.0',
    });
  }
}

export class GoogleUserFactory {
  likeModel(overrides: Partial<UserModel> = {}): UserModel {
    return new UserFactory().likeModel({
      password: undefined,
      roles: defaultGoogleRoles,
      accountProvider: AccountsProvider.GOOGLE,
      accountProviderID: `google-${IDConstants.EXEMPLE}`,
      ...overrides,
    });
  }

  likeUserInCallbBack(
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

  likeEntity(overrides: Partial<UserGoogleLogin> = {}): UserGoogleLogin {
    return {
      email: new EmailVO(EmailConstants.EXEMPLE),
      id: IDConstants.EXEMPLE,
      name: 'test',
      ip: '122.0.0.0',
      ...overrides,
    };
  }
}
