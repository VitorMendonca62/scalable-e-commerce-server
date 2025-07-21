import { CreateUserDTO } from '../../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../../adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { User } from '@auth/domain/entities/user.entity';
import { defaultRoles } from '@auth/domain/types/permissions';
import EmailVO from '@auth/domain/values-objects/email/EmailVO';
import PasswordVO from '@auth/domain/values-objects/password/PasswordVO';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/PhoneNumberConstants';
import UsernameVO from '@auth/domain/values-objects/username/UsernameVO';
import PhoneNumberVO from '@auth/domain/values-objects/phone-number/PhoneNumberVO';
import { EmailConstants } from '@auth/domain/values-objects/email/EmailConstants';
import { NameConstants } from '@auth/domain/values-objects/name/NameConstants';
import NameVO from '@auth/domain/values-objects/name/NameVO';
import { PasswordConstants } from '@auth/domain/values-objects/password/PasswordConstants';
import { UsernameConstants } from '@auth/domain/values-objects/username/UsernameConstants';
import { UserEntity } from '../../adaptars/secondary/database/entities/user.entity';

interface MockUser extends CreateUserDTO {
  _id?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}) => {
  const dto = mockCreateUserDTO(overrides);
  const user = new User({
    email: new EmailVO(dto.email),
    name: new NameVO(dto.name, false),
    password: new PasswordVO(dto.password, true, false, true),
    phonenumber: new PhoneNumberVO(dto.phonenumber, false),
    roles: defaultRoles,
    username: new UsernameVO(dto.username, false),
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
    _id: '7df9e6f0-cab4-4fa6-b165-66696084c019-1',
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
    password: new PasswordVO(dto.password, true, false, false),
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

export const mockLoginUserDTOLikeInstance = (
  overrides: Partial<LoginUserDTO> = {},
): LoginUserDTO => {
  const dto = new LoginUserDTO();
  const keys = Object.keys(overrides);

  dto.email = keys.includes('email') ? overrides.email : EmailConstants.EXEMPLE;
  dto.password = keys.includes('password')
    ? overrides.password
    : PasswordConstants.EXEMPLE;
  return dto;
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

export const mockCreateUserDTOLikeInstance = (
  overrides: Partial<CreateUserDTO> = {},
): CreateUserDTO => {
  const dto = new CreateUserDTO();
  const keys = Object.keys(overrides);

  dto.username = keys.includes('username')
    ? overrides.username
    : UsernameConstants.EXEMPLE;
  dto.email = keys.includes('email') ? overrides.email : EmailConstants.EXEMPLE;
  dto.name = keys.includes('name') ? overrides.name : NameConstants.EXEMPLE;
  dto.password = keys.includes('password')
    ? overrides.password
    : PasswordConstants.EXEMPLE;
  dto.phonenumber = keys.includes('phonenumber')
    ? overrides.phonenumber
    : PhoneNumberConstants.EXEMPLE;
  return dto;
};

export const mockUserList = () => {
  return [
    mockUser({
      username: 'user01',
      _id: '7df9e6f0-cab4-4fa6-b165-66696084c0191',
      email: 'exemple1@exemple.com',
    }),
    mockUser({
      username: 'user02',
      _id: '7df9e6f0-cab4-4fa6-b165-66696084c0192',
      email: 'exemple2@exemple.com',
    }),
    mockUser({
      username: 'user03',
      _id: '7df9e6f0-cab4-4fa6-b165-66696084c0193',
      email: 'exemple3@exemple.com',
    }),
  ];
};

export const userLikeJSON = (overrides: Partial<MockUser> = {}): UserEntity => {
  return {
    _id: '7df9e6f0-cab4-4fa6-b165-66696084c0190',
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
