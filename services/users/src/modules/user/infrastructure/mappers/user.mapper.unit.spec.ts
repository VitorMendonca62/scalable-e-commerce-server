import { IDConstants } from '@modules/user/domain/values-objects/common/constants';
import {
  UserDTOFactory,
  UserFactory,
  UserUpdateFactory,
} from '../helpers/users/factory';
import { UserMapper } from './user.mapper';
import { IDVO } from '@modules/user/domain/values-objects/common/value-object';
import {
  NameVO,
  AvatarVO,
  EmailVO,
  PhoneNumberVO,
  UsernameVO,
} from '@modules/user/domain/values-objects/user/values-object';
import { UserEntity } from '@modules/user/domain/entities/user.entity';
import { defaultRoles } from '@modules/user/domain/constants/roles';
import { UserUpdateEntity } from '@modules/user/domain/entities/user-update.entity';
import { EmailConstants } from '@modules/user/domain/values-objects/user/constants';
import { mockIDConstructor } from '../helpers/values-objects-mock';
import {
  mockAvatarConstructor,
  mockEmailConstructor,
  mockNameConstructor,
  mockPhoneNumberConstructor,
  mockUsernameConstructor,
} from '../helpers/users/values-objects-mock';

describe('UserMapper', () => {
  let mapper: UserMapper;

  beforeEach(async () => {
    mapper = new UserMapper();
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  const dateNow = new Date().getTime();

  describe('createDTOForEntity', () => {
    const dto = UserDTOFactory.createCreateUserDTO();
    const userID = IDConstants.EXEMPLE;
    const email = EmailConstants.EXEMPLE;

    it('should call VOs with correct parameters', async () => {
      mapper.createDTOForEntity(dto, email, userID);

      expect(mockIDConstructor).toHaveBeenCalledWith(userID);
      expect(mockNameConstructor).toHaveBeenCalledWith(dto.name);
      expect(mockUsernameConstructor).toHaveBeenCalledWith(dto.username);
      expect(mockEmailConstructor).toHaveBeenCalledWith(email);
      expect(mockPhoneNumberConstructor).toHaveBeenCalledWith(dto.phoneNumber);
    });

    it('should return User with correct types', async () => {
      const user = mapper.createDTOForEntity(dto, email, userID);

      expect(user).toBeInstanceOf(UserEntity);
      expect(user.userID).toBeInstanceOf(IDVO);
      expect(user.name).toBeInstanceOf(NameVO);
      expect(user.username).toBeInstanceOf(UsernameVO);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.phoneNumber).toBeInstanceOf(PhoneNumberVO);
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.createDTOForEntity(dto, email, userID);

      expect(user.userID.getValue()).toBe(userID);
      expect(user.name.getValue()).toBe(dto.name);
      expect(user.username.getValue()).toBe(dto.username);
      expect(user.email.getValue()).toBe(email);
      expect(user.phoneNumber.getValue()).toBe(dto.phoneNumber);
      expect(user.avatar).toBeUndefined();
      expect(user.roles).toBe(defaultRoles);
      expect(user.createdAt.getTime()).toBe(dateNow);
      expect(user.updatedAt.getTime()).toBe(dateNow);
    });
  });

  describe('updateDTOForEntity', () => {
    const userID = IDConstants.EXEMPLE;

    describe('all fields', () => {
      const dto = UserDTOFactory.createUpdateUserDTO();

      it('should call VOs with correct parameters', async () => {
        mapper.updateDTOForModel(dto, userID);

        expect(mockIDConstructor).toHaveBeenCalledWith(userID);
        expect(mockNameConstructor).toHaveBeenCalledWith(dto.name);
        expect(mockUsernameConstructor).toHaveBeenCalledWith(dto.username);
        expect(mockAvatarConstructor).toHaveBeenCalledWith(dto.avatar);
        expect(mockPhoneNumberConstructor).toHaveBeenCalledWith(
          dto.phoneNumber,
        );
      });

      it('should return UserUpdateEntity with correct types', async () => {
        const user = mapper.updateDTOForModel(dto, userID);

        expect(user).toBeInstanceOf(UserUpdateEntity);
        expect(user.userID).toBeInstanceOf(IDVO);
        expect(user.name).toBeInstanceOf(NameVO);
        expect(user.username).toBeInstanceOf(UsernameVO);
        expect(user.avatar).toBeInstanceOf(AvatarVO);
        expect(user.phoneNumber).toBeInstanceOf(PhoneNumberVO);
        expect(user.updatedAt).toBeInstanceOf(Date);
      });

      it('should return UserUpdateEntity with correct fields', async () => {
        const user = mapper.updateDTOForModel(dto, userID);

        expect(user.userID.getValue()).toBe(userID);
        expect(user.name.getValue()).toBe(dto.name);
        expect(user.username.getValue()).toBe(dto.username);
        expect(user.avatar.getValue()).toBe(dto.avatar);
        expect(user.phoneNumber.getValue()).toBe(dto.phoneNumber);
        expect(user.updatedAt.getTime()).toBe(dateNow);
      });
    });

    describe('no have fields', () => {
      const dto = UserDTOFactory.createUpdateUserDTO({
        name: undefined,
        username: undefined,
        avatar: undefined,
        phoneNumber: undefined,
      });

      it('should call VOs with correct parameters', async () => {
        mapper.updateDTOForModel(dto, userID);

        expect(mockIDConstructor).toHaveBeenCalledWith(userID);
        expect(mockNameConstructor).not.toHaveBeenCalled();
        expect(mockUsernameConstructor).not.toHaveBeenCalled();
        expect(mockEmailConstructor).not.toHaveBeenCalled();
        expect(mockAvatarConstructor).not.toHaveBeenCalled();
        expect(mockPhoneNumberConstructor).not.toHaveBeenCalled();
      });

      it('should return UserUpdateEntity with correct fields', async () => {
        const user = mapper.updateDTOForModel(dto, userID);

        expect(user.userID.getValue()).toBe(userID);
        expect(user.name).toBeUndefined();
        expect(user.username).toBeUndefined();
        expect(user.avatar).toBeUndefined();
        expect(user.phoneNumber).toBeUndefined();
        expect(user.updatedAt.getTime()).toBe(dateNow);
      });
    });
  });

  describe('updateEntityForObject', () => {
    const userUpdateEntity = UserUpdateFactory.createEntity();

    it('should return user like json', async () => {
      const result = mapper.updateEntityForObject(userUpdateEntity);

      expect(result).toEqual({
        userID: userUpdateEntity.userID.getValue(),
        name: userUpdateEntity.name.getValue(),
        username: userUpdateEntity.username.getValue(),
        avatar: userUpdateEntity.avatar.getValue(),
        phoneNumber: userUpdateEntity.phoneNumber.getValue(),
        updatedAt: userUpdateEntity.updatedAt,
      });
    });

    it('should return user like json without same fields', async () => {
      const result = mapper.updateEntityForObject(
        UserUpdateFactory.createEntity({ avatar: undefined, name: undefined }),
      );

      expect(result).toEqual({
        userID: userUpdateEntity.userID.getValue(),
        name: undefined,
        username: userUpdateEntity.username.getValue(),
        avatar: undefined,
        phoneNumber: userUpdateEntity.phoneNumber.getValue(),
        updatedAt: userUpdateEntity.updatedAt,
      });
    });

    it('should return user like json without all fields', async () => {
      const result = mapper.updateEntityForObject(
        UserUpdateFactory.createEntity({
          avatar: undefined,
          name: undefined,
          phoneNumber: undefined,
          username: undefined,
        }),
      );

      expect(result).toEqual({
        userID: userUpdateEntity.userID.getValue(),
        name: undefined,
        username: undefined,
        avatar: undefined,
        phoneNumber: undefined,
        updatedAt: userUpdateEntity.updatedAt,
      });
    });
  });

  describe('entityToModel', () => {
    const userEntity = UserFactory.createEntity();

    it('should return user like json', async () => {
      const result = mapper.entityToModel(userEntity);

      expect(result).toEqual({
        userID: userEntity.userID.getValue(),
        name: userEntity.name.getValue(),
        email: userEntity.email.getValue(),
        username: userEntity.username.getValue(),
        avatar: userEntity.avatar.getValue(),
        phoneNumber: userEntity.phoneNumber.getValue(),
        roles: userEntity.roles,
        createdAt: userEntity.createdAt,
        updatedAt: userEntity.updatedAt,
        addresses: userEntity.addresses,
      });
    });
  });
});
