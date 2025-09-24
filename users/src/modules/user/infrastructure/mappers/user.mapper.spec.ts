import { mockValueObjects } from '../helpers/users/user-values-objects-mock';

mockValueObjects();
import { User } from '@modules/user/domain/entities/user.entity';
import { defaultRoles } from '@modules/user/domain/types/permissions';
import { UserMapper } from './user.mapper';
import IDVO from '@modules/user/domain/values-objects/uuid/id-vo';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { v7 } from 'uuid';
import { UserUpdate } from '@modules/user/domain/entities/user-update.entity';
import {
  UserFactory,
  UserDTO,
  UserUpdateFactory,
} from '../helpers/users/user-factory';
import { AvatarConstants } from '@modules/user/domain/values-objects/user/constants';
import {
  NameVO,
  UsernameVO,
  EmailVO,
  PhoneNumberVO,
  AvatarVO,
} from '@modules/user/domain/values-objects/user/values-object';

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
    const dto = UserDTO.createCreateUserDTO();
    const id = IDConstants.EXEMPLE;

    it('should id in uuid.v7 equals exemple on IDConstants', () => {
      expect(v7()).toBe(id);
    });

    it('should call VOs with correct parameters', async () => {
      mapper.createDTOForModel(dto);

      expect(IDVO).toHaveBeenCalledWith(id);
      expect(NameVO).toHaveBeenCalledWith(dto.name, true);
      expect(UsernameVO).toHaveBeenCalledWith(dto.username, true);
      expect(EmailVO).toHaveBeenCalledWith(dto.email, true);
      expect(PhoneNumberVO).toHaveBeenCalledWith(dto.phonenumber, true);
    });

    it('should return User with correct types', async () => {
      const user = mapper.createDTOForModel(dto);

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
      const user = mapper.createDTOForModel(dto);

      (user.avatar.getValue as unknown as jest.Mock).mockReturnValueOnce(null);

      expect(user.userId.getValue()).toBe(id);
      expect(user.name.getValue()).toBe(dto.name);
      expect(user.username.getValue()).toBe(dto.username);
      expect(user.email.getValue()).toBe(dto.email);
      expect(user.phonenumber.getValue()).toBe(dto.phonenumber);
      expect(user.active).toBe(true);
      expect(user.email_verified).toBe(false);
      expect(user.phone_verified).toBe(false);
      expect(user.avatar.getValue()).toBeNull();
      expect(user.roles).toBe(defaultRoles);
    });

    it('should throw if any value object throws an error', () => {
      (IDVO as jest.Mock).mockImplementation(() => {
        throw new Error('Campo inválido');
      });

      expect(() => mapper.updateDTOForModel(dto, id)).toThrow('Campo inválido');
      (IDVO as jest.Mock).mockRestore();
    });
  });

  describe('updateDTOForEntity', () => {
    const dto = UserDTO.createUpdateUserDTO();
    const id = IDConstants.EXEMPLE;

    it('should call VOs with correct parameters', async () => {
      mapper.updateDTOForModel(dto, id);

      expect(IDVO).toHaveBeenCalledWith(id);
      expect(NameVO).toHaveBeenCalledWith(dto.name, false);
      expect(UsernameVO).toHaveBeenCalledWith(dto.username, false);
      expect(EmailVO).toHaveBeenCalledWith(dto.email, false);
      expect(AvatarVO).toHaveBeenCalledWith(dto.avatar, false);
      expect(PhoneNumberVO).toHaveBeenCalledWith(dto.phonenumber, false);
    });

    it('should return UserUpdate with correct types', async () => {
      const user = mapper.updateDTOForModel(dto, id);

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
      const user = mapper.updateDTOForModel(dto, id);

      expect(user.userId.getValue()).toBe(id);
      expect(user.name.getValue()).toBe(dto.name);
      expect(user.username.getValue()).toBe(dto.username);
      expect(user.email.getValue()).toBe(dto.email);
      expect(user.avatar.getValue()).toBe(dto.avatar);
      expect(user.phonenumber.getValue()).toBe(dto.phonenumber);
    });

    it('should throw if any value object throws an error', () => {
      (IDVO as jest.Mock).mockImplementation(() => {
        throw new Error('Campo inválido');
      });

      expect(() => mapper.updateDTOForModel(dto, id)).toThrow('Campo inválido');
      (IDVO as jest.Mock).mockRestore();
    });
  });

  describe('updateEntityForJSON', () => {
    const userUpdate = UserUpdateFactory.createModel();

    beforeEach(() => {
      mockValueObjects();
    });

    it('return the field null if the field is null ', () => {
      const userUpdate = UserUpdateFactory.createModel({
        avatar: new AvatarVO(null, false),
        name: new NameVO(null, false),
        email: new EmailVO(null, false),
        phonenumber: new PhoneNumberVO(null, false),
        username: new UsernameVO(null, false),
      });

      (userUpdate.avatar.getValue as unknown as jest.Mock).mockReturnValueOnce(
        null,
      );
      (userUpdate.name.getValue as unknown as jest.Mock).mockReturnValueOnce(
        null,
      );
      (userUpdate.email.getValue as unknown as jest.Mock).mockReturnValueOnce(
        null,
      );
      (
        userUpdate.phonenumber.getValue as unknown as jest.Mock
      ).mockReturnValueOnce(null);
      (
        userUpdate.username.getValue as unknown as jest.Mock
      ).mockReturnValueOnce(null);

      const result = mapper.userUpdateModelForJSON(userUpdate);

      expect(result.avatar).toBeNull();
      expect(result.email).toBeNull();
      expect(result.name).toBeNull();
      expect(result.phonenumber).toBeNull();
      expect(result.username).toBeNull();
    });

    it('should return correct JSON structure', () => {
      const result = mapper.userUpdateModelForJSON(userUpdate);

      expect(result).toHaveProperty('avatar');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('phonenumber');
      expect(result).toHaveProperty('updatedAt');
      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('username');
    });

    it('should convert Value Objects to strings', () => {
      const result = mapper.userUpdateModelForJSON(userUpdate);

      expect(typeof result.avatar).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.phonenumber).toBe('string');
      expect(typeof result.userId).toBe('string');
      expect(typeof result.username).toBe('string');
    });

    it('should preserve updatedAt as Date', () => {
      const result = mapper.userUpdateModelForJSON(userUpdate);

      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should return correct values', () => {
      const result = mapper.userUpdateModelForJSON(userUpdate);

      expect(result.avatar).toBe(userUpdate.avatar.getValue());
      expect(result.email).toBe(userUpdate.email.getValue());
      expect(result.name).toBe(userUpdate.name.getValue());
      expect(result.phonenumber).toBe(userUpdate.phonenumber.getValue());
      expect(result.userId).toBe(userUpdate.userId.getValue());
      expect(result.username).toBe(userUpdate.username.getValue());
      expect(result.updatedAt).toBe(userUpdate.updatedAt);
    });
  });

  describe('userToJSON', () => {
    const user = UserFactory.createModel();

    it('should return correct JSON structure', () => {
      const result = mapper.userModelToJSON(user);

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

    it('should convert Value Objects to strings with avatar is null', () => {
      (user.avatar.getValue as unknown as jest.Mock).mockReturnValueOnce(null);

      const result = mapper.userModelToJSON(user);

      expect(typeof result.userId).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.username).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.avatar).toBe('object');
      expect(typeof result.phonenumber).toBe('string');
    });

    it('should return avatar as undefined when avatar is a string', () => {
      const user = UserFactory.createModel({
        avatar: new AvatarVO(AvatarConstants.EXEMPLE, true),
      });

      const result = mapper.userModelToJSON(user);

      expect(typeof result.userId).toBe('string');
      expect(typeof result.name).toBe('string');
      expect(typeof result.username).toBe('string');
      expect(typeof result.email).toBe('string');
      expect(typeof result.avatar).toBe('string');
      expect(typeof result.phonenumber).toBe('string');
    });

    it('should preserve primitive types', () => {
      const result = mapper.userModelToJSON(user);

      expect(typeof result.active).toBe('boolean');
      expect(typeof result.email_verified).toBe('boolean');
      expect(typeof result.phone_verified).toBe('boolean');
      expect(Array.isArray(result.roles)).toBe(true);
    });

    it('should preserve Date objects', () => {
      const result = mapper.userModelToJSON(user);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should return correct values', () => {
      const result = mapper.userModelToJSON(user);

      expect(result._id).toBe(user._id);
      expect(result.userId).toBe(user.userId.getValue());
      expect(result.name).toBe(user.name.getValue());
      expect(result.username).toBe(user.username.getValue());
      expect(result.email).toBe(user.email.getValue());
      expect(result.avatar).toBe(user.avatar.getValue());
      expect(result.active).toBe(user.active);
      expect(result.email_verified).toBe(user.email_verified);
      expect(result.phone_verified).toBe(user.phone_verified);
      expect(result.phonenumber).toBe(user.phonenumber.getValue());
      expect(result.roles).toBe(user.roles);
      expect(result.createdAt).toBe(user.createdAt);
      expect(result.updatedAt).toBe(user.updatedAt);
    });
  });
});
