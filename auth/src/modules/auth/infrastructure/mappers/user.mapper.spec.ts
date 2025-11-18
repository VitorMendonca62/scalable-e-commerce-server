import { mockValueObjects } from '../helpers/tests/values-objects-mock';
mockValueObjects();
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { UserMapper } from './user.mapper';
import EmailVO from '@modules/auth/domain/values-objects/email/email-vo';
import NameVO from '@modules/auth/domain/values-objects/name/name-vo';
import PasswordVO from '@modules/auth/domain/values-objects/password/password-vo';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phone-number/phone-number-vo';
import UsernameVO from '@modules/auth/domain/values-objects/username/username-vo';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import {
  mockCreateUserDTO,
  mockLoginUserDTO,
  mockUser,
  userLikeJSON,
} from '../helpers/tests/tests.helper';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(async () => {
    mockValueObjects();
    mapper = new UserMapper();
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('createDTOForEntity', () => {
    const dto = mockCreateUserDTO();

    it('should call VOs with correct parameters', async () => {
      mapper.createDTOForEntity(dto);

      expect(EmailVO).toHaveBeenCalledWith(dto.email);
      expect(UsernameVO).toHaveBeenCalledWith(dto.username);
      expect(NameVO).toHaveBeenCalledWith(dto.name);
      expect(PasswordVO).toHaveBeenCalledWith(dto.password, true, true);
      expect(PhoneNumberVO).toHaveBeenCalledWith(dto.phonenumber);
    });

    it('should return User with correct types', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(user).toBeInstanceOf(User);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.name).toBeInstanceOf(NameVO);
      expect(user.phonenumber).toBeInstanceOf(PhoneNumberVO);
      expect(user.username).toBeInstanceOf(UsernameVO);
      expect(user.password).toBeInstanceOf(PasswordVO);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(Array.isArray(user.roles)).toBe(true);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(user.email.toString()).toBe(dto.email);
      expect(user.name.toString()).toBe(dto.name);
      expect(user.phonenumber.toString()).toBe(dto.phonenumber);
      expect(user.password.toString()).toBe(dto.password);
      expect(user.username.toString()).toBe(dto.username);
      expect(user.roles).toBe(defaultRoles);
    });

    it('should throw if value object throws error', () => {
      const valuesObjects = [
        UsernameVO,
        NameVO,
        EmailVO,
        PasswordVO,
        PhoneNumberVO,
      ];

      valuesObjects.forEach((VO, index) => {
        (VO as jest.Mock).mockImplementation(() => {
          throw new Error(`Campo inválido - ${index}`);
        });

        expect(() => mapper.createDTOForEntity(dto)).toThrow(
          `Campo inválido - ${index}`,
        );
        (VO as jest.Mock).mockRestore();
      });
    });
  });

  describe('loginDTOForEntity', () => {
    const dto = mockLoginUserDTO();

    it('should call VOs with correct parameters', async () => {
      mapper.loginDTOForEntity(dto);

      expect(EmailVO).toHaveBeenCalledWith(dto.email);
      expect(PasswordVO).toHaveBeenCalledWith(dto.password, true, false);
    });

    it('should return User with correct types', async () => {
      const user = mapper.loginDTOForEntity(dto);

      expect(user).toBeInstanceOf(UserLogin);
      expect(user.password).toBeInstanceOf(PasswordVO);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.loginDTOForEntity(dto);

      expect(user.email.toString()).toBe(dto.email);
      expect(user.password.toString()).toBe(dto.password);
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

  describe('userToJSON', () => {
    const user = mockUser();

    it('should return object like UserEntity', async () => {
      const json = mapper.userToJSON(user);
      expect(json).toMatchObject({
        userID: expect.any(String),
        name: expect.any(String),
        username: expect.any(String),
        email: expect.any(String),
        password: expect.any(String),
        phonenumber: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should return Json with correct fields', async () => {
      const json = mapper.userToJSON(user);

      expect(json).toEqual({
        userID: user.userID,
        name: `${user.name}`,
        username: `${user.username}`,
        email: `${user.email}`,
        password: `${user.password}`,
        phonenumber: `${user.phonenumber}`,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });
  });

  describe('jsonToUser', () => {
    const json = userLikeJSON();

    it('should call VOs with correct parameters', async () => {
      mapper.jsonToUser(json);

      expect(EmailVO).toHaveBeenCalledWith(json.email);
      expect(UsernameVO).toHaveBeenCalledWith(json.username);
      expect(NameVO).toHaveBeenCalledWith(json.name);
      expect(PasswordVO).toHaveBeenCalledWith(json.password, true, false);
      expect(PhoneNumberVO).toHaveBeenCalledWith(json.phonenumber);
    });

    it('should return User with correct types', async () => {
      const user = mapper.jsonToUser(json);

      expect(user).toBeInstanceOf(User);
      expect(user.roles).toEqual(defaultRoles);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.name).toBeInstanceOf(NameVO);
      expect(user.phonenumber).toBeInstanceOf(PhoneNumberVO);
      expect(user.username).toBeInstanceOf(UsernameVO);
      expect(user.password).toBeInstanceOf(PasswordVO);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
      expect(typeof user.userID).toBe('string');
      expect(Array.isArray(user.roles)).toBe(true);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.jsonToUser(json);

      expect(user.email.toString()).toBe(json.email);
      expect(user.name.toString()).toBe(json.name);
      expect(user.phonenumber.toString()).toBe(json.phonenumber);
      expect(user.username.toString()).toBe(json.username);
      expect(user.password.toString()).toBe(json.password);
      expect(user.roles).toBe(defaultRoles);
    });

    it('should throw if value object throws error', () => {
      const valuesObjects = [
        UsernameVO,
        NameVO,
        EmailVO,
        PasswordVO,
        PhoneNumberVO,
      ];

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
