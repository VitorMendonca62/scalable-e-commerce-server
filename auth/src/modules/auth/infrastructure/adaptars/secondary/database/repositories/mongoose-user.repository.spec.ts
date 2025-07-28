import { MongooseUserRepository } from './mongoose-user.repository';
import { userLikeJSON } from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';

describe('MongooseUserRepository', () => {
  let repository: MongooseUserRepository;

  let UserModel: any;

  let mockedExecFindOne: jest.Mock;
  let mockedSavePrototype: jest.Mock;

  beforeEach(async () => {
    UserModel = jest.fn();

    repository = new MongooseUserRepository(UserModel);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    const user = userLikeJSON();

    beforeEach(() => {
      mockedSavePrototype = jest.fn().mockReturnValue(undefined);
      UserModel.prototype.save = mockedSavePrototype;
    });

    it('should create user', async () => {
      const response = await repository.create(user);

      expect(response).toBeUndefined();
      expect(UserModel).toHaveBeenCalledWith(user);

      expect(mockedSavePrototype).toHaveBeenCalled();
    });

    it('should create multiple users', async () => {
      const usersToCreate = [];

      for (let i = 0; i <= 10; i++) {
        usersToCreate.push(userLikeJSON());
      }

      for (const user of usersToCreate) {
        repository.create(user);
        expect(UserModel).toHaveBeenCalledWith(user);
        expect(mockedSavePrototype).toHaveBeenCalled();
      }
    });
  });

  describe('findOne', () => {
    const validEmail = EmailConstants.EXEMPLE;
    const validUsername = UsernameConstants.EXEMPLE;

    beforeEach(() => {
      mockedExecFindOne = jest.fn().mockReturnValue(userLikeJSON());
      UserModel.findOne = jest.fn().mockReturnValue({
        exec: mockedExecFindOne,
      });
    });

    it('should return user with email passed', async () => {
      const response = await repository.findOne({ email: validEmail });

      expect(UserModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(userLikeJSON());
      expect(response.email).toBe(validEmail);
    });

    it('should return undefined when not found user with email', async () => {
      mockedExecFindOne.mockReturnValue(undefined);

      const response = await repository.findOne({
        email: 'emailnotfound@email.com',
      });

      expect(response).toBeUndefined();
    });

    it('should return user with username passed', async () => {
      const response = await repository.findOne({ username: validUsername });

      expect(UserModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(userLikeJSON());
      expect(response.username).toBe(validUsername);
    });

    it('should return undefined when not found user with username', async () => {
      mockedExecFindOne.mockReturnValue(undefined);

      const response = await repository.findOne({
        username: 'usernamenotfound',
      });

      expect(response).toBeUndefined();
    });

    it('should return user with username and email passed', async () => {
      const response = await repository.findOne({
        username: validUsername,
        email: validEmail,
      });

      expect(UserModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(userLikeJSON());
      expect(response.username).toBe(validUsername);
      expect(response.email).toBe(validEmail);
    });

    it('should return undefined when not found user with username', async () => {
      mockedExecFindOne.mockReturnValue(undefined);

      const response = await repository.findOne({
        username: 'usernamenotfound',
      });

      expect(response).toBeUndefined();
    });
  });
});
