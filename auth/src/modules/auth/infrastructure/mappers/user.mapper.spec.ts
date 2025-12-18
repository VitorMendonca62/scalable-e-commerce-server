import { mockValueObjects } from '../helpers/tests/values-objects-mock';
mockValueObjects(['all']);

// Helpers
import {
  mockLoginUserDTO,
  mockUserLikeJSON,
} from '../helpers/tests/user-helper';
import { mockPasswordHasher } from '../helpers/tests/password-helpers';

// VO's
import PhoneNumberVO from '@auth/domain/values-objects/phone-number/phone-number-vo';
import IDVO from '@auth/domain/values-objects/id/id-vo';
import EmailVO from '@auth/domain/values-objects/email/email-vo';
import PasswordVO from '@auth/domain/values-objects/password/password-vo';

// Entities
import { User } from '@auth/domain/entities/user.entity';
import { UserLogin } from '@auth/domain/entities/user-login.entity';

// Function
import { UserMapper } from './user.mapper';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';

// Orther

describe('UserMapper', () => {
  let mapper: UserMapper;
  let passwordHasher: PasswordHasher;

  beforeEach(async () => {
    mockValueObjects(['all']);
    passwordHasher = mockPasswordHasher();
    mapper = new UserMapper(passwordHasher);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('loginDTOForEntity', () => {
    const dto = mockLoginUserDTO();

    it('should call VOs with correct parameters', async () => {
      mapper.loginDTOForEntity(dto);

      expect(EmailVO).toHaveBeenCalledWith(dto.email);
      expect(PasswordVO).toHaveBeenCalledWith(dto.password, passwordHasher);
    });

    it('should return User with correct types', async () => {
      const user = mapper.loginDTOForEntity(dto);

      expect(user).toBeInstanceOf(UserLogin);
      expect(user.password).toBeInstanceOf(PasswordVO);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.loginDTOForEntity(dto);

      expect(user.email.getValue()).toBe(dto.email);
    });

    it('should throw if value object throws error', () => {
      const valuesObjects = [EmailVO, PasswordVO];

      valuesObjects.forEach((VO, index) => {
        (VO as jest.Mock).mockImplementation(() => {
          throw new Error(`Campo inválido - ${index}`);
        });

        expect(() => mapper.loginDTOForEntity(dto)).toThrow(
          `Campo inválido - ${index}`,
        );
        (VO as jest.Mock).mockRestore();
      });
    });
  });

  describe('jsonToUser', () => {
    const json = mockUserLikeJSON();

    it('should call VOs with correct parameters', async () => {
      mapper.jsonToUser(json);

      expect(IDVO).toHaveBeenCalledWith(json.userID);
      expect(EmailVO).toHaveBeenCalledWith(json.email);
      expect(PasswordHashedVO).toHaveBeenCalledWith(
        json.password,
        passwordHasher,
      );
      expect(PhoneNumberVO).toHaveBeenCalledWith(json.phoneNumber);
    });

    it('should return User with correct types', async () => {
      const user = mapper.jsonToUser(json);

      expect(user).toBeInstanceOf(User);
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
      const valuesObjects = [EmailVO, PasswordHashedVO, PhoneNumberVO, IDVO];

      valuesObjects.forEach((VO, index) => {
        (VO as jest.Mock).mockImplementation(() => {
          throw new Error(`Campo inválido - ${index}`);
        });

        expect(() => mapper.jsonToUser(json)).toThrow(
          `Campo inválido - ${index}`,
        );
        (VO as jest.Mock).mockRestore();
      });
    });
  });
});
