import { PasswordConstants } from '@modules/user/domain/constants/password-constants';
import { defaultRoles } from '@modules/user/domain/constants/roles';
import { UserEntity } from '@modules/user/domain/entities/user.entity';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';
import {
  NameConstants,
  UsernameConstants,
  EmailConstants,
  PhoneNumberConstants,
  AvatarConstants,
} from '@modules/user/domain/values-objects/user/constants';
import {
  CreateUserDTO,
  UpdateUserDTO,
  ValidateCodeForValidateEmailDTO,
  ValidateEmailDTO,
} from '../../adaptars/primary/http/dtos/user/dtos';
import UserModel from '../../adaptars/secondary/database/models/user.model';
import { UserUpdateEntity } from '@modules/user/domain/entities/user-update.entity';
import { IDVO } from '@modules/user/domain/values-objects/common/value-object';
import {
  NameVO,
  UsernameVO,
  PhoneNumberVO,
  AvatarVO,
  EmailVO,
} from '@modules/user/domain/values-objects/user/values-object';

export class UserDTOFactory {
  static createCreateUserDTO(
    overrides: Partial<CreateUserDTO> = {},
  ): CreateUserDTO {
    return {
      name: NameConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      password: PasswordConstants.EXEMPLE,
      phoneNumber: PhoneNumberConstants.EXEMPLE,
      ...overrides,
    };
  }

  static createCreateUserDTOLikeInstance(
    overrides: Partial<CreateUserDTO> = {},
  ): CreateUserDTO {
    const dto = new CreateUserDTO();
    const keys = Object.keys(overrides);

    dto.username = keys.includes('username')
      ? overrides.username
      : UsernameConstants.EXEMPLE;
    dto.name = keys.includes('name') ? overrides.name : NameConstants.EXEMPLE;
    dto.password = keys.includes('password')
      ? overrides.password
      : PasswordConstants.EXEMPLE;
    dto.phoneNumber = keys.includes('phoneNumber')
      ? overrides.phoneNumber
      : PhoneNumberConstants.EXEMPLE;
    return dto;
  }

  static createUpdateUserDTO(
    overrides: Partial<UpdateUserDTO> = {},
  ): UpdateUserDTO {
    return {
      name: NameConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      phoneNumber: PhoneNumberConstants.EXEMPLE,
      avatar: AvatarConstants.EXEMPLE,
      ...overrides,
    };
  }

  static createUpdateUserDTOLikeInstance(
    overrides: Partial<UpdateUserDTO> = {},
  ): UpdateUserDTO {
    const dto = new UpdateUserDTO();
    const keys = Object.keys(overrides);

    dto.username = keys.includes('username')
      ? overrides.username
      : UsernameConstants.EXEMPLE;
    dto.name = keys.includes('name') ? overrides.name : NameConstants.EXEMPLE;
    dto.phoneNumber = keys.includes('phoneNumber')
      ? overrides.phoneNumber
      : PhoneNumberConstants.EXEMPLE;
    dto.avatar = keys.includes('avatar')
      ? overrides.avatar
      : AvatarConstants.EXEMPLE;
    return dto;
  }

  static createValidateEmailDTO(
    overrides: Partial<ValidateEmailDTO> = {},
  ): ValidateEmailDTO {
    return {
      email: EmailConstants.EXEMPLE,
      ...overrides,
    };
  }

  static createValidateEmailDTOLikeInstance(
    overrides: Partial<ValidateEmailDTO> = {},
  ): ValidateEmailDTO {
    const dto = new ValidateEmailDTO();
    const keys = Object.keys(overrides);

    dto.email = keys.includes('email')
      ? overrides.email
      : EmailConstants.EXEMPLE;

    return dto;
  }

  static createValidateCodeForValidateEmailDTO(
    overrides: Partial<ValidateCodeForValidateEmailDTO> = {},
  ): ValidateCodeForValidateEmailDTO {
    return {
      email: EmailConstants.EXEMPLE,
      code: 'AAAAAA',
      ...overrides,
    };
  }

  static createValidateCodeForValidateEmailDTOLikeInstance(
    overrides: Partial<ValidateCodeForValidateEmailDTO> = {},
  ): ValidateCodeForValidateEmailDTO {
    const dto = new ValidateCodeForValidateEmailDTO();
    const keys = Object.keys(overrides);

    dto.email = keys.includes('email')
      ? overrides.email
      : EmailConstants.EXEMPLE;
    dto.code = keys.includes('code') ? overrides.code : 'AAAAAA';

    return dto;
  }
}

export class UserFactory {
  static createEntity(overrides: Partial<UserEntity> = {}): UserEntity {
    const data = {
      userID: new IDVO(IDConstants.EXEMPLE),
      email: new EmailVO(EmailConstants.EXEMPLE),
      name: new NameVO(NameConstants.EXEMPLE),
      username: new UsernameVO(UsernameConstants.EXEMPLE),
      phoneNumber: new PhoneNumberVO(PhoneNumberConstants.EXEMPLE),
      active: true,
      email_verified: false,
      phone_verified: false,
      avatar: new AvatarVO(AvatarConstants.EXEMPLE),
      roles: defaultRoles,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
    return new UserEntity(data);
  }

  static createModel(
    overrides: Partial<UserModel> = {},
  ): Omit<UserModel, 'id'> {
    return {
      userID: IDConstants.EXEMPLE,
      name: NameConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      email: EmailConstants.EXEMPLE,
      phoneNumber: PhoneNumberConstants.EXEMPLE,
      avatar: null,
      roles: defaultRoles,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }
}

export class UserUpdateFactory {
  static createEntity(
    overrides: Partial<UserUpdateEntity> = {},
  ): UserUpdateEntity {
    const data = {
      userID: new IDVO(IDConstants.EXEMPLE),
      name: new NameVO(NameConstants.EXEMPLE),
      username: new UsernameVO(UsernameConstants.EXEMPLE),
      phoneNumber: new PhoneNumberVO(PhoneNumberConstants.EXEMPLE),
      avatar: new AvatarVO(AvatarConstants.EXEMPLE),
      updatedAt: new Date(),
      ...overrides,
    };
    return new UserUpdateEntity(data);
  }

  static createModel(
    overrides: Partial<{
      [K in keyof UserUpdateEntity]: UserModel[K];
    }> = {},
  ): Partial<UserModel> {
    return {
      userID: IDConstants.EXEMPLE,
      name: NameConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      avatar: AvatarConstants.EXEMPLE,
      phoneNumber: PhoneNumberConstants.EXEMPLE,
      updatedAt: new Date(),
      ...overrides,
    };
  }
}
