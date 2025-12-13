import { MongooseUserRepository } from './mongoose-user.repository';
import { mockUserLikeJSON } from '@auth/infrastructure/helpers/tests/tests.helper';
import { EmailConstants } from '@auth/domain/values-objects/email/email-constants';
import { PhoneNumberConstants } from '@auth/domain/values-objects/phone-number/phone-number-constants';

describe('MongooseUserRepository', () => {
  let repository: MongooseUserRepository;

  let UserModel: any;

  let mockedExecFindOne: jest.Mock;

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
});
