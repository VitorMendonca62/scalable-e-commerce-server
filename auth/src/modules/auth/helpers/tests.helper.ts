import { v4 } from 'uuid';
import { CreateUserDTO } from '../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '../core/domain/entities/user-login.entity';
import { User } from '../core/domain/entities/user.entity';
import { defaultRoles } from '../core/domain/types/permissions';
import EmailVO from '../core/domain/types/values-objects/email.vo';
import NameVO from '../core/domain/types/values-objects/name.vo';
import PasswordVO from '../core/domain/types/values-objects/password.vo';
import PhoneNumberVO from '../core/domain/types/values-objects/phonenumber.vo';
import UsernameVO from '../core/domain/types/values-objects/username.vo';

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
    email: 'exemple@exemple.com',
    password: '@Vh1234567',
    ...overrides,
  };
};

export const mockCreateUserDTO = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  return {
    username: 'defaultuser',
    email: 'exemple@exemple.com',
    name: 'Default user',
    password: '@Vh1234567',
    phonenumber: '+5581999999999',
    ...overrides,
  };
};

export const mockUserList = () => {
  return [
    mockUser({ username: 'user01', _id: '1', email: 'exemple1@exemple.com' }),
    mockUser({ username: 'user02', _id: '2', email: 'exemple2@exemple.com' }),
    mockUser({ username: 'user03', _id: '3', email: 'exemple3@exemple.com' }),
  ];
};
