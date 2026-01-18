import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import EmailVO from '@auth/domain/values-objects/email/email-vo';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import IDVO from '@auth/domain/values-objects/id/id-vo';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/phone-number-constants';
import PhoneNumberVO from '@auth/domain/values-objects/phone-number/phone-number-vo';
import { LoginUserDTO } from '@auth/infrastructure/adaptars/primary/http/dtos/login-user.dto';
import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';
import { mockPasswordHasher } from './password-mocks';
import { PasswordHashedConstants } from '@auth/domain/values-objects/password-hashed/password-hashed-constants';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import { defaultRoles } from '@auth/domain/constants/roles';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';

// Common
export const mockUserModel = (
  overrides: Partial<UserModel> = {},
): UserModel => {
  return {
    userID: IDConstants.EXEMPLE,
    email: EmailConstants.EXEMPLE,
    password: PasswordHashedConstants.EXEMPLE,
    phoneNumber: PhoneNumberConstants.EXEMPLE,
    roles: defaultRoles,
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
    accountProvider: AccountsProvider.DEFAULT,
    accountProviderID: undefined,
    active: true,
    ...overrides,
  };
};

export const mockUser = (overrides: Partial<UserModel> = {}) => {
  const userJSON = mockUserModel(overrides);
  const user = new UserEntity({
    userID: new IDVO(userJSON.userID),
    email: new EmailVO(userJSON.email),
    password: new PasswordHashedVO(userJSON.password, mockPasswordHasher()),
    phoneNumber: new PhoneNumberVO(userJSON.phoneNumber),
    roles: defaultRoles,
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
    accountProvider: AccountsProvider.DEFAULT,
    accountProviderID: undefined,
    active: true,
  });

  return user;
};

// Login
export const mockLoginUserDTO = (
  overrides: Partial<LoginUserDTO> = {},
): LoginUserDTO => {
  return {
    email: EmailConstants.EXEMPLE,
    password: PasswordConstants.EXEMPLE,
    ...overrides,
  };
};

export const mockLoginUser = (overrides: Partial<LoginUserDTO> = {}) => {
  const dto = mockLoginUserDTO(overrides);
  return new UserLogin({
    email: new EmailVO(dto.email),
    password: new PasswordVO(dto.password, false, mockPasswordHasher()),
    ip: '122.0.0.0',
  });
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

// Login > Google

export const mockUserGoogleInCallBack = (
  overrides: Partial<UserGoogleInCallBack> = {},
): UserGoogleInCallBack => {
  return {
    email: EmailConstants.EXEMPLE,
    id: IDConstants.EXEMPLE,
    name: 'test',
    username: 'test',
    ...overrides,
  };
};

export const mockGoogleLogin = (
  overrides: Partial<UserGoogleLogin> = {},
): UserGoogleLogin => {
  return {
    email: new EmailVO(EmailConstants.EXEMPLE),
    id: IDConstants.EXEMPLE,
    name: 'test',
    ip: '122.0.0.0',
    ...overrides,
  };
};
