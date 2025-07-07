import { User } from '@modules/auth/domain/entities/user.entity';
import { UserLogin } from '@modules/auth/domain/entities/user-login.entity';
import { mockValueObjects } from '../helpers/tests/values-objects-mock';
// import { mockUserClass } from '../helpers/tests/tests.helper';
// mockUserClass();
mockValueObjects();
import { UserMapper } from './user.mapper';
import EmailVO from '@modules/auth/domain/values-objects/email/EmailVO';
import NameVO from '@modules/auth/domain/values-objects/name/NameVO';
import PasswordVO from '@modules/auth/domain/values-objects/password/PasswordVO';
import PhoneNumberVO from '@modules/auth/domain/values-objects/phone-number/PhoneNumberVO';
import UsernameVO from '@modules/auth/domain/values-objects/username/UsernameVO';
import { defaultRoles } from '@modules/auth/domain/types/permissions';
import { mockCreateUserDTO } from '../helpers/tests/tests.helper';

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
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(user.email.toString()).toBe(dto.email);
      expect(user.name.toString()).toBe(dto.name);
      expect(user.phonenumber.toString()).toBe(dto.phonenumber);
      expect(user.username.toString()).toBe(dto.username);
    });

    it('should throw if value object throws error', () => {
      const valueObjects = [
        ['UsernameVO', UsernameVO],
        ['NameVO', NameVO],
        ['EmailVO', EmailVO],
        ['PasswordVO', PasswordVO],
        ['PhoneNumberVO', PhoneNumberVO],
      ];

      for (const [, VO] of valueObjects) {
        (VO as jest.Mock).mockImplementation(() => {
          throw new Error('Campo inválido');
        });

        expect(() => mapper.createDTOForEntity(dto)).toThrow('Campo inválido');
      }
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
  });

  describe('loginDTOForEntity', () => {
    const dto = mockCreateUserDTO();

    it('should return User with correct fields', async () => {
      const userLogin = mapper.loginDTOForEntity(dto);

      expect(userLogin).toBeInstanceOf(UserLogin);
      expect(userLogin.email.toString()).toBe(dto.email);
    });
  });
});
