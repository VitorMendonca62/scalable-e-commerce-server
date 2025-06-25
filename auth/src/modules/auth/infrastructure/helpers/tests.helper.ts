import { v4 } from 'uuid';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { User } from '@modules/auth/domain/entities/user.entity';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import EmailVO from '@modules/auth/domain/values-objects/email/EmailVO';
import PasswordVO from '@modules/auth/domain/values-objects/password/PassworVO';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phonumber/PhoneNumberConstants';
import UsernameVO from '@modules/auth/domain/values-objects/username/UsernameVO';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phonumber/PhoneNumberVO';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { NameConstants } from '@modules/auth/domain/values-objects/name/NameConstants';
import NameVO from '@modules/auth/domain/values-objects/name/NameVO';
import { PasswordConstants } from '@modules/auth/domain/values-objects/password/PasswordConstants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';
import { UserEntity } from '../adaptars/secondary/database/entities/user.entity';

interface MockUser extends CreateUserDTO {
  _id?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}) => {
  const dto = mockCreateUserDTO(overrides);
  const user = new User({
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

  if (overrides._id) {
    user._id = overrides._id;
  }

  return user;
};

export const mockLoginUser = (overrides: Partial<MockUser> = {}) => {
  const dto = mockLoginUserDTO(overrides);
  return new UserLogin({
    email: new EmailVO(dto.email),
    password: new PasswordVO(dto.password, true),
    accessedAt: new Date('2025-02-16T17:21:05.370Z'),
  });
};

export const mockLoginUserDTO = (
  overrides: Partial<LoginUserDTO> = {},
): LoginUserDTO => {
  return {
    email: EmailConstants.EXEMPLE,
    password: PasswordConstants.EXEMPLE,
    ...overrides,
  };
};

export const mockCreateUserDTO = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  return {
    username: UsernameConstants.EXEMPLE,
    email: EmailConstants.EXEMPLE,
    name: NameConstants.EXEMPLE,
    password: PasswordConstants.EXEMPLE,
    phonenumber: PhoneNumberConstants.EXEMPLE,
    ...overrides,
  };
};

export const mockUserList = () => {
  return [
    mockUser({ username: 'user01', _id: v4(), email: 'exemple1@exemple.com' }),
    mockUser({ username: 'user02', _id: v4(), email: 'exemple2@exemple.com' }),
    mockUser({ username: 'user03', _id: v4(), email: 'exemple3@exemple.com' }),
  ];
};

export const userLikeJSON = (overrides: Partial<MockUser> = {}): UserEntity => {
  return {
    _id: '2',
    name: NameConstants.EXEMPLE,
    username: UsernameConstants.EXEMPLE,
    email: EmailConstants.EXEMPLE,
    password: PasswordConstants.EXEMPLE,
    phonenumber: PhoneNumberConstants.EXEMPLE,
    roles: defaultRoles,
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
    ...overrides,
  };
};
