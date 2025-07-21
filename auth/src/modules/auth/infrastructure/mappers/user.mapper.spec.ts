import { mockValueObjects } from '../helpers/tests/values-objects-mock';
mockValueObjects();
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { UserMapper } from './user.mapper';
import EmailVO from '@modules/auth/domain/values-objects/email/EmailVO';
import NameVO from '@modules/auth/domain/values-objects/name/NameVO';
import PasswordVO from '@modules/auth/domain/values-objects/password/PasswordVO';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phone-number/PhoneNumberVO';
import UsernameVO from '@modules/auth/domain/values-objects/username/UsernameVO';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import {
  mockCreateUserDTO,
  mockLoginUserDTO,
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
      expect(UsernameVO).toHaveBeenCalledWith(dto.username, false);
      expect(NameVO).toHaveBeenCalledWith(dto.name, false);
      expect(PasswordVO).toHaveBeenCalledWith(dto.password, true, false, true);
      expect(PhoneNumberVO).toHaveBeenCalledWith(dto.phonenumber, false);
    });

    it('should return User with correct types', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(user).toBeInstanceOf(User);
      expect(user.roles).toEqual(defaultRoles);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.name).toBeInstanceOf(NameVO);
      expect(user.phonenumber).toBeInstanceOf(PhoneNumberVO);
      expect(user.username).toBeInstanceOf(UsernameVO);
      expect(user.password).toBeInstanceOf(PasswordVO);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(user.email.toString()).toBe(dto.email);
      expect(user.name.toString()).toBe(dto.name);
      expect(user.phonenumber.toString()).toBe(dto.phonenumber);
      expect(user.username.toString()).toBe(dto.username);
      expect(user.password.toString()).toBe(dto.password);
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
      expect(PasswordVO).toHaveBeenCalledWith(dto.password, true, false, false);
    });

    it('should return User with correct types', async () => {
      const user = mapper.loginDTOForEntity(dto);

      expect(user).toBeInstanceOf(UserLogin);
      expect(user.password).toBeInstanceOf(PasswordVO);
      expect(user.accessedAt).toBeInstanceOf(Date);
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
});
