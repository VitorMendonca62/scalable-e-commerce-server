import { mockValueObjects } from '../helpers/values-objects-mock';

mockValueObjects();
import { User } from '@modules/user/domain/entities/user.entity';
import { defaultRoles } from '@modules/user/domain/types/permissions';
import EmailVO from '@modules/user/domain/values-objects/user/email/email-vo';
import NameVO from '@modules/user/domain/values-objects/user/name/name-vo';
import PhoneNumberVO from '@modules/user/domain/values-objects/user/phone-number/phone-number-vo';
import UsernameVO from '@modules/user/domain/values-objects/user/username/username-vo';
import {
  mockCreateUserDTO,
  mockUpdateUserDTO,
  mockUser,
  mockUserUpdatedDTOToUserUpdated,
} from '../helpers/tests.helper';
import { UserMapper } from './user.mapper';
import IDVO from '@modules/user/domain/values-objects/uuid/id-vo';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { v7 } from 'uuid';
import AvatarVO from '@modules/user/domain/values-objects/user/avatar/avatar-vo';
import { UserUpdate } from '@modules/user/domain/entities/user-update.entity';

jest.mock('uuid', () => ({
  __esModule: true,
  v7: jest.fn(() => IDConstants.EXEMPLE),
}));

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
    const id = IDConstants.EXEMPLE;

    it('should id in uuid.v7 equals exemple on IDConstants', () => {
      expect(v7()).toBe(id);
    });

    it('should call VOs with correct parameters', async () => {
      mapper.createDTOForEntity(dto);

      expect(IDVO).toHaveBeenCalledWith(id);
      expect(NameVO).toHaveBeenCalledWith(dto.name, true);
      expect(UsernameVO).toHaveBeenCalledWith(dto.username, true);
      expect(EmailVO).toHaveBeenCalledWith(dto.email, true);
      expect(PhoneNumberVO).toHaveBeenCalledWith(dto.phonenumber, true);
    });

    it('should return User with correct types', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(user).toBeInstanceOf(User);
      expect(user.userId).toBeInstanceOf(IDVO);
      expect(user.name).toBeInstanceOf(NameVO);
      expect(user.username).toBeInstanceOf(UsernameVO);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.phonenumber).toBeInstanceOf(PhoneNumberVO);
      expect(typeof user.active == 'boolean').toBe(true);
      expect(typeof user.email_verified == 'boolean').toBe(true);
      expect(typeof user.phone_verified == 'boolean').toBe(true);
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.createDTOForEntity(dto);

      expect(`${user.userId}`).toBe(id);
      expect(`${user.name}`).toBe(dto.name);
      expect(`${user.username}`).toBe(dto.username);
      expect(`${user.email}`).toBe(dto.email);
      expect(`${user.phonenumber}`).toBe(dto.phonenumber);
      expect(user.active).toBe(true);
      expect(user.email_verified).toBe(false);
      expect(user.phone_verified).toBe(false);
      expect(user.avatar).toBe(null);
      expect(user.roles).toBe(defaultRoles);
    });

    it('should throw if any value object throws an error', () => {
      (IDVO as jest.Mock).mockImplementation(() => {
        throw new Error('Campo inválido');
      });

      expect(() => mapper.updateDTOForEntity(dto, id)).toThrow(
        'Campo inválido',
      );
      (IDVO as jest.Mock).mockRestore();
    });
  });

  describe('updateDTOForEntity', () => {
    const dto = mockUpdateUserDTO();
    const id = IDConstants.EXEMPLE;

    it('should call VOs with correct parameters', async () => {
      mapper.updateDTOForEntity(dto, id);

      expect(IDVO).toHaveBeenCalledWith(id);
      expect(NameVO).toHaveBeenCalledWith(dto.name, false);
      expect(UsernameVO).toHaveBeenCalledWith(dto.username, false);
      expect(EmailVO).toHaveBeenCalledWith(dto.email, false);
      expect(AvatarVO).toHaveBeenCalledWith(dto.avatar, false);
      expect(PhoneNumberVO).toHaveBeenCalledWith(dto.phonenumber, false);
    });

    it('should return UserUpdate with correct types', async () => {
      const user = mapper.updateDTOForEntity(dto, id);

      expect(user).toBeInstanceOf(UserUpdate);
      expect(user.userId).toBeInstanceOf(IDVO);
      expect(user.name).toBeInstanceOf(NameVO);
      expect(user.username).toBeInstanceOf(UsernameVO);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.avatar).toBeInstanceOf(AvatarVO);
      expect(user.phonenumber).toBeInstanceOf(PhoneNumberVO);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return UserUpdate with correct fields', async () => {
      const user = mapper.updateDTOForEntity(dto, id);

      expect(`${user.userId}`).toBe(id);
      expect(`${user.name}`).toBe(dto.name);
      expect(`${user.username}`).toBe(dto.username);
      expect(`${user.email}`).toBe(dto.email);
      expect(`${user.avatar}`).toBe(dto.avatar);
      expect(`${user.phonenumber}`).toBe(dto.phonenumber);
    });

    it('should throw if any value object throws an error', () => {
      (IDVO as jest.Mock).mockImplementation(() => {
        throw new Error('Campo inválido');
      });

      expect(() => mapper.updateDTOForEntity(dto, id)).toThrow(
        'Campo inválido',
      );
      (IDVO as jest.Mock).mockRestore();
    });
  });

  describe('updateEntityForJSON', () => {
    const userId = new IDVO(IDConstants.EXEMPLE);
    const userUpdate = mockUserUpdatedDTOToUserUpdated(
      mockUpdateUserDTO(),
      userId,
    );

    it('should return correct JSON structure', () => {
      const result = mapper.updateEntityForJSON(userUpdate);

      expect(result).toHaveProperty('avatar');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('phonenumber');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('username');
    });

    it('should convert Value Objects to strings', () => {
      const result = mapper.updateEntityForJSON(userUpdate);

      expect(typeof result.avatar).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.phonenumber).toBe('string');
      expect(typeof result.userId).toBe('string');
      expect(typeof result.username).toBe('string');
    });

    it('should preserve updatedAt as Date', () => {
      const result = mapper.updateEntityForJSON(userUpdate);

      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should return correct values', () => {
      const result = mapper.updateEntityForJSON(userUpdate);

      expect(result.avatar).toBe(`${userUpdate.avatar}`);
      expect(result.email).toBe(`${userUpdate.email}`);
      expect(result.name).toBe(`${userUpdate.name}`);
      expect(result.phonenumber).toBe(`${userUpdate.phonenumber}`);
      expect(result.userId).toBe(`${userUpdate.userId}`);
      expect(result.username).toBe(`${userUpdate.username}`);
      expect(result.updatedAt).toBe(userUpdate.updatedAt);
    });
  });

  describe('userToJSON', () => {
    const user = mockUser();

    it('should return correct JSON structure', () => {
      const result = mapper.userToJSON(user);

      expect(result).toHaveProperty('_id');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('username');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('avatar');
      expect(result).toHaveProperty('active');
      expect(result).toHaveProperty('email_verified');
      expect(result).toHaveProperty('phone_verified');
      expect(result).toHaveProperty('phonenumber');
      expect(result).toHaveProperty('roles');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should convert Value Objects to strings', () => {
      const result = mapper.userToJSON(user);

      expect(typeof result.userId).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.username).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.avatar).toBe('string');
      expect(typeof result.phonenumber).toBe('string');
    });

    it('should preserve primitive types', () => {
      const result = mapper.userToJSON(user);

      expect(typeof result.active).toBe('boolean');
      expect(typeof result.email_verified).toBe('boolean');
      expect(typeof result.phone_verified).toBe('boolean');
      expect(Array.isArray(result.roles)).toBe(true);
    });

    it('should preserve Date objects', () => {
      const result = mapper.userToJSON(user);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should return correct values', () => {
      const result = mapper.userToJSON(user);

      expect(result._id).toBe(user._id);
      expect(result.userId).toBe(`${user.userId}`);
      expect(result.name).toBe(`${user.name}`);
      expect(result.username).toBe(`${user.username}`);
      expect(result.email).toBe(`${user.email}`);
      expect(result.avatar).toBe(`${user.avatar}`);
      expect(result.active).toBe(user.active);
      expect(result.email_verified).toBe(user.email_verified);
      expect(result.phone_verified).toBe(user.phone_verified);
      expect(result.phonenumber).toBe(`${user.phonenumber}`);
      expect(result.roles).toBe(user.roles);
      expect(result.createdAt).toBe(user.createdAt);
      expect(result.updatedAt).toBe(user.updatedAt);
    });
  });
});
