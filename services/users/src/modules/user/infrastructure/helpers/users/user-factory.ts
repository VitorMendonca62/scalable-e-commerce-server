import { User } from '@modules/user/domain/entities/user.entity';
import { defaultRoles } from '@modules/user/domain/types/permissions';
import { UserValuesObjectFactory } from './user-values-object-factory';
import { UserUpdate } from '@modules/user/domain/entities/user-update.entity';
import {
  NameConstants,
  UsernameConstants,
  EmailConstants,
  PhoneNumberConstants,
  AvatarConstants,
} from '@modules/user/domain/values-objects/user/constants';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { UserEntity } from '../../adaptars/secondary/database/entities/user.entity';
import { CreateUserDTO } from '../../adaptars/primary/http/dtos/create-user.dto';
import { PasswordConstants } from '@modules/user/domain/constants/password-constants';
import { UpdateUserDTO } from '../../adaptars/primary/http/dtos/update-user.dto';
import { AvatarVO } from '@modules/user/domain/values-objects/user/values-object';

export class UserDTO {
  static createCreateUserDTO(
    overrides: Partial<
      Record<keyof CreateUserDTO, CreateUserDTO[keyof CreateUserDTO]>
    > = {},
  ): CreateUserDTO {
    return {
      name: NameConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      email: EmailConstants.EXEMPLE,
      password: PasswordConstants.EXEMPLE,
      phonenumber: PhoneNumberConstants.EXEMPLE,
      ...overrides,
    } as CreateUserDTO;
  }

  static createCreateUserDTOLikeInstance(
    overrides: Partial<CreateUserDTO> = {},
  ): CreateUserDTO {
    const dto = new CreateUserDTO();
    const keys = Object.keys(overrides);

    dto.username = keys.includes('username')
      ? overrides.username
      : UsernameConstants.EXEMPLE;
    dto.email = keys.includes('email')
      ? overrides.email
      : EmailConstants.EXEMPLE;
    dto.name = keys.includes('name') ? overrides.name : NameConstants.EXEMPLE;
    dto.password = keys.includes('password')
      ? overrides.password
      : PasswordConstants.EXEMPLE;
    dto.phonenumber = keys.includes('phonenumber')
      ? overrides.phonenumber
      : PhoneNumberConstants.EXEMPLE;
    return dto;
  }

  static createUpdateUserDTO(
    overrides: Partial<
      Record<keyof UpdateUserDTO, UpdateUserDTO[keyof UpdateUserDTO]>
    > = {},
  ): UpdateUserDTO {
    return {
      name: NameConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      email: EmailConstants.EXEMPLE,
      phonenumber: PhoneNumberConstants.EXEMPLE,
      avatar: AvatarConstants.EXEMPLE,
      ...overrides,
    } as UpdateUserDTO;
  }

  static createUpdateUserDTOLikeInstance(
    overrides: Partial<UpdateUserDTO> = {},
  ): UpdateUserDTO {
    const dto = new UpdateUserDTO();
    const keys = Object.keys(overrides);

    dto.username = keys.includes('username')
      ? overrides.username
      : UsernameConstants.EXEMPLE;
    dto.email = keys.includes('email')
      ? overrides.email
      : EmailConstants.EXEMPLE;
    dto.name = keys.includes('name') ? overrides.name : NameConstants.EXEMPLE;
    dto.phonenumber = keys.includes('phonenumber')
      ? overrides.phonenumber
      : PhoneNumberConstants.EXEMPLE;
    dto.avatar = keys.includes('avatar')
      ? overrides.avatar
      : AvatarConstants.EXEMPLE;
    return dto;
  }
}

export class UserFactory {
  static createModel(overrides: Partial<Record<keyof User, any>> = {}): User {
    const vos = UserValuesObjectFactory.getObjects(
      ['email', 'name', 'phonenumber', 'userId', 'username'],
      [],
    );

    const data = {
      userId: vos['userId']!,
      email: vos['email']!,
      name: vos['name']!,
      phonenumber: vos['phonenumber']!,
      username: vos['username']!,
      active: true,
      email_verified: false,
      phone_verified: false,
      avatar: new AvatarVO(null, false),
      roles: defaultRoles,
      createdAt: new Date('2025-09-02T13:30:08.633Z'),
      updatedAt: new Date('2025-09-02T13:30:08.633Z'),
      ...overrides,
    };
    return new User(data);
  }

  static createEntity(
    overrides: Partial<Record<keyof User, any>> = {},
  ): UserEntity {
    const data = {
      userId: IDConstants.EXEMPLE,
      name: NameConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      email: EmailConstants.EXEMPLE,
      phonenumber: PhoneNumberConstants.EXEMPLE,
      active: true,
      email_verified: false,
      phone_verified: false,
      avatar: null,
      roles: defaultRoles,
      createdAt: new Date('2025-09-02T13:30:08.633Z'),
      updatedAt: new Date('2025-09-02T13:30:08.633Z'),
      ...overrides,
    };
    return data as unknown as UserEntity;
  }
}

export class UserUpdateFactory {
  static createModel(
    overrides: Partial<Record<keyof UserUpdate, any>> = {},
  ): UserUpdate {
    const vos = UserValuesObjectFactory.getObjects(
      [],
      ['email', 'name', 'phonenumber', 'userId', 'username', 'avatar'],
    );

    const data = {
      userId: vos['userId']!,
      email: vos['email']!,
      name: vos['name']!,
      phonenumber: vos['phonenumber']!,
      username: vos['username']!,
      avatar: vos['avatar']!,
      updatedAt: new Date('2025-09-02T13:30:08.633Z'),
      ...overrides,
    };
    return new UserUpdate(data);
  }

  static createEntity(
    overrides: Partial<Record<keyof UserUpdate, any>> = {},
  ): Record<keyof UserUpdate, any> {
    return {
      avatar: AvatarConstants.EXEMPLE,
      email: EmailConstants.EXEMPLE,
      name: NameConstants.EXEMPLE,
      phonenumber: PhoneNumberConstants.EXEMPLE,
      updatedAt: new Date('2025-09-02T13:30:08.633Z'),
      userId: IDConstants.EXEMPLE,
      username: UsernameConstants.EXEMPLE,
      ...overrides,
    } as Record<keyof UserUpdate, any>;
  }
}
