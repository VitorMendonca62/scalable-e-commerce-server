import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { defaultGoogleRoles } from '@auth/domain/constants/roles';
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import {
  GoogleUserFactory,
  UserFactory,
} from '@auth/infrastructure/helpers/tests/user-factory';
import { Model } from 'mongoose';
import { type Mock } from 'vitest';
import { UserDocument } from '../models/user.model';
import { MongooseUserRepository } from './mongoose-user.repository';

describe('MongooseUserRepository', () => {
  let repository: MongooseUserRepository;

  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    userModel = vi.fn() as any;

    repository = new MongooseUserRepository(userModel);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findOne', () => {
    const user = UserFactory.createModel();

    let mockedExecFindOne: Mock;
    let mockedLeanFindOne: Mock;

    beforeEach(() => {
      mockedLeanFindOne = vi.fn();
      mockedExecFindOne = vi.fn().mockReturnValue(user);
      userModel.findOne = vi.fn();
      (userModel.findOne as Mock).mockReturnValue({
        lean: mockedLeanFindOne,
      });
      mockedLeanFindOne.mockReturnValue({
        exec: mockedExecFindOne,
      });
    });

    it('should return user with one field', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: EmailConstants.EXEMPLE,
        deletedAt: null,
      });
      expect(mockedExecFindOne).toHaveBeenCalled();
      expect(response).toEqual(user);
      expect(response.email).toBe(EmailConstants.EXEMPLE);
    });

    it('should return user with many fields', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
        userID: IDConstants.EXEMPLE,
      });

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: EmailConstants.EXEMPLE,
        userID: IDConstants.EXEMPLE,
        deletedAt: null,
      });
      expect(mockedExecFindOne).toHaveBeenCalled();
      expect(response).toEqual(user);
      expect(response.email).toBe(EmailConstants.EXEMPLE);
    });

    it('should return undefined when not found user', async () => {
      mockedExecFindOne.mockReturnValue(undefined);

      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(response).toBeNull();
    });
  });

  describe('findSessionUserByEmail', () => {
    const user = UserFactory.createModel();

    let mockedExecFindOne: Mock;
    let mockedLeanFindOne: Mock;

    beforeEach(() => {
      mockedLeanFindOne = vi.fn();
      mockedExecFindOne = vi.fn().mockReturnValue(user);
      userModel.findOne = vi.fn();
      (userModel.findOne as Mock).mockReturnValue({
        lean: mockedLeanFindOne,
      });
      mockedLeanFindOne.mockReturnValue({
        exec: mockedExecFindOne,
      });
    });

    it('should return session user by email', async () => {
      const response = await repository.findSessionUserByEmail(
        EmailConstants.EXEMPLE,
      );

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: EmailConstants.EXEMPLE,
        deletedAt: null,
      });
      expect(mockedExecFindOne).toHaveBeenCalled();
      expect(response).toEqual({
        userID: user.userID,
        email: user.email,
        password: user.password,
        roles: user.roles,
        accountProvider: user.accountProvider as AccountsProvider,
        accountProviderID: user.accountProviderID,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
    });

    it('should return null when user is not found', async () => {
      mockedExecFindOne.mockReturnValue(undefined);

      const response = await repository.findSessionUserByEmail(
        EmailConstants.EXEMPLE,
      );

      expect(response).toBeNull();
    });
  });

  describe('update', () => {
    let mockedExecUpdateOne: Mock;

    beforeEach(() => {
      mockedExecUpdateOne = vi.fn();
      userModel.updateOne = vi.fn().mockReturnValue({
        exec: mockedExecUpdateOne,
      });
    });

    it('should call all functions with correct parameters and delete', async () => {
      await repository.update(IDConstants.EXEMPLE, {
        password: PasswordConstants.EXEMPLE,
      });

      expect(userModel.updateOne).toHaveBeenCalledWith(
        {
          userID: IDConstants.EXEMPLE,
          deletedAt: null,
        },
        { $set: { password: PasswordConstants.EXEMPLE } },
      );
      expect(mockedExecUpdateOne).toHaveBeenCalled();
    });
  });

  describe('create', () => {
    const user = UserFactory.createModel();
    let mockedSavePrototype: Mock;

    beforeEach(() => {
      mockedSavePrototype = vi.fn().mockReturnValue(undefined);
      userModel.prototype.save = mockedSavePrototype;
    });

    it('should save user', async () => {
      const result = await repository.create(user);

      expect(result).toBeUndefined();
      expect(userModel).toHaveBeenCalledWith(user);
      expect(mockedSavePrototype).toHaveBeenCalled();
    });
  });

  describe('createGoogleUser', () => {
    const user = GoogleUserFactory.createEntity();
    const userID = IDConstants.EXEMPLE;

    let mockedSavePrototype: Mock;
    let savedUser: any;

    beforeEach(() => {
      savedUser = {
        userID,
        email: user.email.getValue(),
        password: undefined,
        roles: defaultGoogleRoles,
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      mockedSavePrototype = vi.fn().mockResolvedValue({
        toObject: () => savedUser,
      });

      userModel = vi.fn().mockImplementation(function (this: any, doc) {
        this.save = mockedSavePrototype;
        this.doc = doc;
      }) as any;

      repository = new MongooseUserRepository(userModel);
    });

    it('should create a google user and return session user', async () => {
      const result = await repository.createGoogleUser(user, userID);

      expect(userModel).toHaveBeenCalled();
      const createdDoc = (userModel as unknown as Mock).mock.calls[0][0];
      expect(createdDoc).toMatchObject({
        userID,
        email: user.email.getValue(),
        password: undefined,
        roles: defaultGoogleRoles,
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: user.id,
        deletedAt: null,
      });
      expect(mockedSavePrototype).toHaveBeenCalled();
      expect(result).toEqual({
        userID: savedUser.userID,
        email: savedUser.email,
        password: savedUser.password,
        roles: savedUser.roles,
        accountProvider: savedUser.accountProvider as AccountsProvider,
        accountProviderID: savedUser.accountProviderID,
        createdAt: savedUser.createdAt,
        updatedAt: savedUser.updatedAt,
      });
    });
  });

  describe('updateAccountProvider', () => {
    let mockedExecUpdateOne: Mock;

    beforeEach(() => {
      mockedExecUpdateOne = vi.fn();
      userModel.updateOne = vi.fn().mockReturnValue({
        exec: mockedExecUpdateOne,
      });
    });

    it('should update account provider fields', async () => {
      await repository.updateAccountProvider(
        IDConstants.EXEMPLE,
        AccountsProvider.GOOGLE,
        IDConstants.EXEMPLE,
      );

      expect(userModel.updateOne).toHaveBeenCalledWith(
        {
          userID: IDConstants.EXEMPLE,
          deletedAt: null,
        },
        {
          $set: {
            accountProvider: AccountsProvider.GOOGLE,
            accountProviderID: IDConstants.EXEMPLE,
          },
        },
      );
      expect(mockedExecUpdateOne).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    let mockedExecDelete: Mock;

    beforeEach(() => {
      mockedExecDelete = vi.fn();
      userModel.updateOne = vi.fn().mockReturnValue({
        exec: mockedExecDelete,
      });
    });

    it('should call all functions with correct parameters and delete', async () => {
      const deletedAt = new Date();
      await repository.delete(IDConstants.EXEMPLE, deletedAt);

      expect(userModel.updateOne).toHaveBeenCalledWith(
        {
          userID: IDConstants.EXEMPLE,
          deletedAt: null,
        },
        { $set: { deletedAt: deletedAt } },
      );
      expect(mockedExecDelete).toHaveBeenCalled();
    });
  });
});
