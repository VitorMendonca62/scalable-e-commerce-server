// Helpers
import {
  GoogleUserFactory,
  LoginUserFactory,
  UserFactory,
} from '../helpers/tests/user-factory';

// Entities
import { UserEntity } from '@auth/domain/entities/user.entity';
import { UserLogin } from '@auth/domain/entities/user-login.entity';

// Function
import { UserMapper } from './user.mapper';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { defaultGoogleRoles } from '@auth/domain/constants/roles';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { type Mock } from 'vitest';
import {
  mockEmailConstructor,
  mockIDConstructor,
  mockPasswordConstructor,
  mockPasswordHashedConstructor,
  mockPhoneNumberConstructor,
} from '../helpers/tests/values-objects-mock';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';
import EmailVO from '@auth/domain/values-objects/email/email-vo';
import IDVO from '@auth/domain/values-objects/id/id-vo';
import PhoneNumberVO from '@auth/domain/values-objects/phone-number/phone-number-vo';
import { PasswordHasherFactory } from '../helpers/tests/password-factory';

describe('UserMapper', () => {
  let mapper: UserMapper;
  let passwordHasher: PasswordHasher;

  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));

  beforeEach(async () => {
    passwordHasher = new PasswordHasherFactory().default();

    mapper = new UserMapper(passwordHasher);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('loginDTOForEntity', () => {
    const dto = new LoginUserFactory().likeDTO();
    const ip = '120.0.0.0';

    it('should call VOs with correct parameters', async () => {
      mapper.loginDTOForEntity(dto, ip);

      expect(mockEmailConstructor).toHaveBeenCalledWith(dto.email);
      expect(mockPasswordConstructor).toHaveBeenCalledWith(
        dto.password,
        false,
        passwordHasher,
      );
    });

    it('should return User with correct types', async () => {
      const user = mapper.loginDTOForEntity(dto, ip);

      expect(user).toBeInstanceOf(UserLogin);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.password).toBeInstanceOf(PasswordVO);
      expect(typeof user.ip).toBe('string');
    });

    it('should return User with correct fields', async () => {
      const user = mapper.loginDTOForEntity(dto, ip);

      expect(user.email.getValue()).toBe(dto.email);
      expect(user.password.getValue()).toBe(dto.password);
      expect(user.ip).toBe(ip);
    });

    it('should throw if value object throws error', () => {
      const valuesObjects = [mockEmailConstructor, mockPasswordConstructor];

      valuesObjects.forEach((VO, index) => {
        (VO as Mock).mockImplementation(() => {
          throw new Error(`Campo inválido - ${index}`);
        });

        try {
          mapper.loginDTOForEntity(dto, ip);
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(`Campo inválido - ${index}`);
          expect(error.data).toBeUndefined();
        }
        (VO as Mock).mockRestore();
      });
    });
  });

  describe('googleLoginDTOForEntity', () => {
    const dto = new GoogleUserFactory().likeUserInCallbBack();
    const ip = '120.0.0.0';

    it('should call VOs with correct parameters', async () => {
      mapper.googleLoginDTOForEntity(dto, ip);

      expect(mockEmailConstructor).toHaveBeenCalledWith(dto.email);
    });

    it('should return User with correct types', async () => {
      const user = mapper.googleLoginDTOForEntity(dto, ip);

      expect(user).toBeInstanceOf(UserGoogleLogin);
      expect(typeof user.name).toBe('string');
      expect(typeof user.id).toBe('string');
      expect(typeof user.ip).toBe('string');
    });

    it('should return User with correct fields', async () => {
      const user = mapper.googleLoginDTOForEntity(dto, ip);

      expect(user.email.getValue()).toBe(dto.email);
      expect(user.name).toBe('test');
      expect(user.id).toBe(IDConstants.EXEMPLE);
      expect(user.ip).toBe(ip);
    });

    it('should throw if value object throws error', () => {
      const valuesObjects = [mockEmailConstructor];

      valuesObjects.forEach((VO, index) => {
        (VO as Mock).mockImplementation(() => {
          throw new Error(`Campo inválido - ${index}`);
        });

        try {
          mapper.googleLoginDTOForEntity(dto, ip);
          expect.fail('Should have thrown an error');
        } catch (error: any) {
          expect(error).toBeInstanceOf(Error);
          expect(error.message).toBe(`Campo inválido - ${index}`);
          expect(error.data).toBeUndefined();
        }
        (VO as Mock).mockRestore();
      });
    });
  });

  describe('jsonToUser', () => {
    const userModel = new UserFactory().likeModel();

    it('should call VOs with correct parameters', async () => {
      mapper.jsonToUser(userModel);

      expect(mockIDConstructor).toHaveBeenCalledWith(userModel.userID);
      expect(mockEmailConstructor).toHaveBeenCalledWith(userModel.email);
      expect(mockPasswordHashedConstructor).toHaveBeenCalledWith(
        userModel.password,
        passwordHasher,
      );
      expect(mockPhoneNumberConstructor).toHaveBeenCalledWith(
        userModel.phoneNumber,
      );
    });

    it('should return User with correct types', async () => {
      const user = mapper.jsonToUser(userModel);

      expect(user).toBeInstanceOf(UserEntity);
      expect(user.userID).toBeInstanceOf(IDVO);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.password).toBeInstanceOf(PasswordHashedVO);
      expect(user.phoneNumber).toBeInstanceOf(PhoneNumberVO);
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.jsonToUser(userModel);

      expect(user.userID.getValue()).toBe(userModel.userID);
      expect(user.email.getValue()).toBe(userModel.email);
      expect(user.password.getValue()).toBe(userModel.password);
      expect(user.phoneNumber.getValue()).toBe(userModel.phoneNumber);
      expect(user.createdAt).toBe(userModel.createdAt);
      expect(user.updatedAt).toBe(userModel.updatedAt);
    });

    it('should throw if value object throws error', () => {
      const valuesObjects = [
        mockEmailConstructor,
        mockPasswordHashedConstructor,
        mockPhoneNumberConstructor,
        mockIDConstructor,
      ];

      valuesObjects.forEach((VO, index) => {
        (VO as Mock).mockImplementation(() => {
          throw new Error(`Campo inválido - ${index}`);
        });

        expect(() => mapper.jsonToUser(userModel)).toThrow(
          `Campo inválido - ${index}`,
        );
        (VO as Mock).mockRestore();
      });
    });
  });

  describe('googleUserCreateForJSON', () => {
    const userGoogleLogin = new GoogleUserFactory().likeEntity();

    it('should return user like json', async () => {
      const result = mapper.googleUserCreateForJSON(
        userGoogleLogin,
        IDConstants.EXEMPLE,
      );

      expect(result).toEqual({
        userID: IDConstants.EXEMPLE,
        email: userGoogleLogin.email.getValue(),
        password: undefined,
        phoneNumber: undefined,
        roles: defaultGoogleRoles,
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: userGoogleLogin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
      });
    });
  });
});
