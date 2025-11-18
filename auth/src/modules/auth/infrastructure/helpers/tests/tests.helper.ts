import { CreateUserDTO } from '../../adaptars/primary/http/dtos/create-user.dto';
import { LoginUserDTO } from '../../adaptars/primary/http/dtos/login-user.dto';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { User } from '@auth/domain/entities/user.entity';
import { defaultRoles } from '@auth/domain/types/permissions';
import EmailVO from '@modules/auth/domain/values-objects/email/email-vo';
import PasswordVO from '@modules/auth/domain/values-objects/password/password-vo';
import { PhoneNumberConstants } from '@modules/auth/domain/values-objects/phone-number/phone-number-constants';
import UsernameVO from '@modules/auth/domain/values-objects/username/username-vo';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phone-number/phone-number-vo';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/email-constants';
import { NameConstants } from '@modules/auth/domain/values-objects/name/name-constants';
import { PasswordConstants } from '@modules/auth/domain/values-objects/password/password-constants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/username-constants';
import { UserEntity } from '../../adaptars/secondary/database/entities/user.entity';
import NameVO from '@modules/auth/domain/values-objects/name/name-vo';

interface MockUser extends CreateUserDTO {
  userID?: string;
}

export const mockUser = (overrides: Partial<MockUser> = {}) => {
  const dto = mockCreateUserDTO(overrides);
  const user = new User({
    email: new EmailVO(dto.email),
    name: new NameVO(dto.name),
    password: new PasswordVO(dto.password, true, true),
    phonenumber: new PhoneNumberVO(dto.phonenumber),
    roles: defaultRoles,
    username: new UsernameVO(dto.username),
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
    userID: '7df9e6f0-cab4-4fa6-b165-66696084c019-1',
  });

  if (overrides.userID) {
    user.userID = overrides.userID;
  }

  return user;
};

export const mockLoginUser = (overrides: Partial<MockUser> = {}) => {
  const dto = mockLoginUserDTO(overrides);
  return new UserLogin({
    email: new EmailVO(dto.email),
    password: new PasswordVO(dto.password, true, false),
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

export const userLikeJSON = (overrides: Partial<MockUser> = {}): UserEntity => {
  return {
    userID: '7df9e6f0-cab4-4fa6-b165-66696084c0190',
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
