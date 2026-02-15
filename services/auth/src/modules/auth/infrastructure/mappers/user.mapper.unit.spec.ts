import {
  GoogleUserFactory,
  LoginUserFactory,
  UserFactory,
} from '../helpers/tests/user-factory';
import { UserEntity } from '@auth/domain/entities/user.entity';
import { UserLogin } from '@auth/domain/entities/user-login.entity';
import { UserMapper } from './user.mapper';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { defaultGoogleRoles, defaultRoles } from '@auth/domain/constants/roles';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { type Mock } from 'vitest';
import {
  mockEmailConstructor,
  mockIDConstructor,
  mockPasswordConstructor,
  mockPasswordHashedConstructor,
} from '../helpers/tests/values-objects-mock';
import { PasswordHasherFactory } from '../helpers/tests/password-factory';
import {
  EmailVO,
  IDVO,
  PasswordHashedVO,
  PasswordVO,
} from '@auth/domain/values-objects';
import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
  PasswordHashedConstants,
} from '@auth/domain/values-objects/constants';
import { CreateExternalUserDTO } from '../adaptars/primary/microservices/dtos/create-user.dto';

describe('UserMapper', () => {
  let mapper: UserMapper;
  let passwordHasher: PasswordHasher;

  beforeEach(async () => {
    passwordHasher = new PasswordHasherFactory().default();

    mapper = new UserMapper(passwordHasher);
  });

  it('should be defined', () => {
    expect(mapper).toBeDefined();
  });

  describe('loginDTOForEntity', () => {
    const dto = LoginUserFactory.createDTO();
    const ip = '120.0.0.0';
    const agent = 'agent';

    it('should call VOs with correct parameters', async () => {
      mapper.loginDTOForEntity(dto, ip, agent);

      expect(mockEmailConstructor).toHaveBeenCalledWith(dto.email);
      expect(mockPasswordConstructor).toHaveBeenCalledWith(
        dto.password,
        passwordHasher,
      );
    });

    it('should return User with correct types', async () => {
      const user = mapper.loginDTOForEntity(dto, ip, agent);

      expect(user).toBeInstanceOf(UserLogin);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.password).toBeInstanceOf(PasswordVO);
      expect(typeof user.ip).toBe('string');
    });

    it('should return User with correct fields', async () => {
      const user = mapper.loginDTOForEntity(dto, ip, agent);

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
          mapper.loginDTOForEntity(dto, ip, agent);
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
    const dto = GoogleUserFactory.createUserInCallbBack();
    const ip = '120.0.0.0';
    const agent = 'agent';

    it('should call VOs with correct parameters', async () => {
      mapper.googleLoginDTOForEntity(dto, ip, agent);

      expect(mockEmailConstructor).toHaveBeenCalledWith(dto.email);
    });

    it('should return User with correct types', async () => {
      const user = mapper.googleLoginDTOForEntity(dto, ip, agent);

      expect(user).toBeInstanceOf(UserGoogleLogin);
      expect(typeof user.name).toBe('string');
      expect(typeof user.id).toBe('string');
      expect(typeof user.ip).toBe('string');
    });

    it('should return User with correct fields', async () => {
      const user = mapper.googleLoginDTOForEntity(dto, ip, agent);

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
          mapper.googleLoginDTOForEntity(dto, ip, agent);
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

  describe('modelToEntity', () => {
    const userModel = UserFactory.createModel({
      password: PasswordHashedConstants.EXEMPLE,
    });

    it('should call VOs with correct parameters', async () => {
      mapper.modelToEntity(userModel);

      expect(mockIDConstructor).toHaveBeenCalledWith(userModel.userID);
      expect(mockEmailConstructor).toHaveBeenCalledWith(userModel.email);
      expect(mockPasswordHashedConstructor).toHaveBeenCalledWith(
        userModel.password,
        passwordHasher,
      );
    });

    it('should return User with correct types', async () => {
      const user = mapper.modelToEntity(userModel);

      expect(user).toBeInstanceOf(UserEntity);
      expect(user.userID).toBeInstanceOf(IDVO);
      expect(user.email).toBeInstanceOf(EmailVO);
      expect(user.password).toBeInstanceOf(PasswordHashedVO);
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return User with correct fields', async () => {
      const user = mapper.modelToEntity(userModel);

      expect(user.userID.getValue()).toBe(userModel.userID);
      expect(user.email.getValue()).toBe(userModel.email);
      expect(user.password.getValue()).toBe(userModel.password);
      expect(user.createdAt).toBe(userModel.createdAt);
      expect(user.updatedAt).toBe(userModel.updatedAt);
    });
  });

  describe('googleEntityForModel', () => {
    const userGoogleLogin = GoogleUserFactory.createEntity();

    it('should return user like json', async () => {
      const result = mapper.googleEntityForModel(
        userGoogleLogin,
        IDConstants.EXEMPLE,
      );

      expect(result).toEqual({
        userID: IDConstants.EXEMPLE,
        email: userGoogleLogin.email.getValue(),
        password: undefined,
        roles: defaultGoogleRoles,
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: userGoogleLogin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });
    });
  });

  describe('externalUserForModel', () => {
    const payload: CreateExternalUserDTO = {
      createdAt: new Date().toDateString(),
      updatedAt: new Date().toDateString(),
      email: EmailConstants.EXEMPLE,
      password: PasswordConstants.EXEMPLE,
      roles: defaultRoles,
      userID: IDConstants.EXEMPLE,
    };

    it('should return user like json', async () => {
      const result = mapper.externalUserForModel(payload);

      expect(result).toEqual({
        userID: payload.userID,
        email: payload.email,
        password: payload.password,
        roles: payload.roles,
        accountProvider: AccountsProvider.DEFAULT,
        accountProviderID: undefined,
        createdAt: new Date(payload.createdAt),
        updatedAt: new Date(payload.updatedAt),
        deletedAt: null,
      });
    });
  });
});
