// Helpers
import {
  mockGoogleLogin,
  mockLoginUserDTO,
  mockUserGoogleInCallBack,
  mockUserModel,
} from '../helpers/tests/user-mocks';
import { mockPasswordHasher } from '../helpers/tests/password-mocks';

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

describe('UserMapper', () => {
  let mapper: UserMapper;
  let passwordHasher: PasswordHasher;

  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-01-01T16:00:00.000Z'));

  beforeEach(async () => {
    passwordHasher = mockPasswordHasher();
    mapper = new UserMapper(passwordHasher);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('loginDTOForEntity', () => {
    const dto = mockLoginUserDTO();
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
    const dto = mockUserGoogleInCallBack();
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
    const json = mockUserModel();

    it('should call VOs with correct parameters', async () => {
      mapper.jsonToUser(json);

      expect(mockIDConstructor).toHaveBeenCalledWith(json.userID);
      expect(mockEmailConstructor).toHaveBeenCalledWith(json.email);
      expect(mockPasswordHashedConstructor).toHaveBeenCalledWith(
        json.password,
        passwordHasher,
      );
      expect(mockPhoneNumberConstructor).toHaveBeenCalledWith(json.phoneNumber);
    });

    it('should return User with correct types', async () => {
      const user = mapper.jsonToUser(json);

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
      const user = mapper.jsonToUser(json);

      expect(user.userID.getValue()).toBe(json.userID);
      expect(user.email.getValue()).toBe(json.email);
      expect(user.password.getValue()).toBe(json.password);
      expect(user.phoneNumber.getValue()).toBe(json.phoneNumber);
      expect(user.createdAt).toBe(json.createdAt);
      expect(user.updatedAt).toBe(json.updatedAt);
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

        expect(() => mapper.jsonToUser(json)).toThrow(
          `Campo inválido - ${index}`,
        );
        (VO as Mock).mockRestore();
      });
    });
  });

  describe('googleUserCreateForJSON', () => {
    const user = mockGoogleLogin();

    it('should return user like json', async () => {
      const result = mapper.googleUserCreateForJSON(user, IDConstants.EXEMPLE);

      expect(result).toEqual({
        userID: IDConstants.EXEMPLE,
        email: user.email.getValue(),
        password: undefined,
        phoneNumber: undefined,
        roles: defaultGoogleRoles,
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: true,
      });
    });
  });
});
