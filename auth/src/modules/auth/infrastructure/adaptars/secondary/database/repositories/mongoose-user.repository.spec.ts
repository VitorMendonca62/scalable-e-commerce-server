import { MongooseUserRepository } from './mongoose-user.repository';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/user-helper';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/phone-number-constants';
import { PasswordConstants } from '@auth/domain/values-objects/password/password-constants';
import { IDConstants } from '@auth/domain/values-objects/id/id-constants';

describe('MongooseUserRepository', () => {
  let repository: MongooseUserRepository;

  let UserModel: any;

  let mockedExecFindOne: jest.Mock;
  let mockedExecUpdateOne: jest.Mock;

  beforeEach(async () => {
    UserModel = jest.fn();

    repository = new MongooseUserRepository(UserModel);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findOne', () => {
    beforeEach(() => {
      mockedExecFindOne = jest.fn().mockReturnValue(mockUserLikeJSON());
      UserModel.findOne = jest.fn().mockReturnValue({
        exec: mockedExecFindOne,
      });
    });

    it('should return user with one field', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
      });

      expect(UserModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(mockUserLikeJSON());
      expect(response.email).toBe(EmailConstants.EXEMPLE);
    });

    it('should return user with many fields', async () => {
      const response = await repository.findOne({
        email: EmailConstants.EXEMPLE,
        phoneNumber: PhoneNumberConstants.EXEMPLE,
      });

      expect(UserModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(mockUserLikeJSON());
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
    beforeEach(() => {
      mockedExecUpdateOne = jest.fn();
      UserModel.updateOne = jest.fn().mockReturnValue({
        exec: mockedExecUpdateOne,
      });
    });

    it('should call all functions with correct parameters and delete', async () => {
      await repository.update(IDConstants.EXEMPLE, {
        password: PasswordConstants.EXEMPLE,
      });

      expect(UserModel.updateOne).toHaveBeenCalledWith(
        {
          userID: IDConstants.EXEMPLE,
        },
        { $set: { password: PasswordConstants.EXEMPLE } },
      );
      expect(mockedExecUpdateOne).toHaveBeenCalled();
    });
  });
});
