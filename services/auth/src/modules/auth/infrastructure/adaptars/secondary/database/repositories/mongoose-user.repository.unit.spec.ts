import {
  EmailConstants,
  IDConstants,
  PasswordConstants,
} from '@auth/domain/values-objects/constants';
import { UserFactory } from '@auth/infrastructure/helpers/tests/user-factory';
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

    beforeEach(() => {
      mockedExecFindOne = vi.fn().mockReturnValue(user);
      userModel.findOne = vi.fn().mockReturnValue({
        exec: mockedExecFindOne,
      });
    });

    it('should return user with one field', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(userModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(user);
      expect(response.email).toBe(EmailConstants.EXEMPLE);
    });

    it('should return user with many fields', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(userModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(user);
      expect(response.email).toBe(EmailConstants.EXEMPLE);
    });

    it('should return undefined when not found user', async () => {
      mockedExecFindOne.mockReturnValue(undefined);

      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(response).toBeUndefined();
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

      expect(result).toEqual(user);
      expect(userModel).toHaveBeenCalledWith(user);
      expect(mockedSavePrototype).toHaveBeenCalled();
    });
  });
});
