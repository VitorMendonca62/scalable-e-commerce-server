import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { User } from '@auth/domain/entities/user.entity';
import { defaultRoles } from '@auth/domain/types/permissions';
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
import { mockPasswordHasher } from './password-helpers';
import { PasswordHashedConstants } from '@auth/domain/values-objects/password-hashed/password-hashed-constants';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';

// Common
export const mockUserLikeJSON = (
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
    ...overrides,
  };
};

export const mockUser = (overrides: Partial<UserModel> = {}) => {
  const userJSON = mockUserLikeJSON(overrides);
  const user = new User({
    userID: new IDVO(userJSON.userID),
    email: new EmailVO(userJSON.email),
    password: new PasswordHashedVO(userJSON.password, mockPasswordHasher()),
    phoneNumber: new PhoneNumberVO(userJSON.phoneNumber),
    roles: defaultRoles,
    createdAt: new Date('2025-02-16T17:21:05.370Z'),
    updatedAt: new Date('2025-02-16T17:21:05.370Z'),
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
