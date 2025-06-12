import { v4 } from 'uuid';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { User } from '@modules/auth/domain/entities/user.entity';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import EmailVO from '@modules/auth/domain/values-objects/email.vo';
import NameVO from '@modules/auth/domain/values-objects/name.vo';
import PasswordVO from '@modules/auth/domain/values-objects/password.vo';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phonenumber.vo';
import UsernameVO from '@modules/auth/domain/values-objects/username.vo';
import { UserJSON } from '@modules/auth/domain/entities/user-json.entity';

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
    email: EmailVO.EXEMPLE,
    password: PasswordVO.EXEMPLE,
    ...overrides,
  };
};

export const mockCreateUserDTO = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  return {
    username: UsernameVO.EXEMPLE,
    email: EmailVO.EXEMPLE,
    name: NameVO.EXEMPLE,
    password: PasswordVO.EXEMPLE,
    phonenumber: PhoneNumberVO.EXEMPLE,
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

export const userLikeJSON = (
  overrides: Partial<CreateUserDTO> = {},
): UserJSON => {
  return {
    name: NameVO.EXEMPLE,
    username: UsernameVO.EXEMPLE,
    email: EmailVO.EXEMPLE,
    password: PasswordVO.EXEMPLE,
    phonenumber: PhoneNumberVO.EXEMPLE,
    roles: defaultRoles,
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
    ...overrides,
  };
};
