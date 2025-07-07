import { Test, TestingModule } from '@nestjs/testing';
import { MongooseUserRepository } from './mongoose-user.repository';
import { userLikeJSON } from '@modules/auth/infrastructure/helpers/tests/tests.helper';
import { getModelToken } from '@nestjs/mongoose';
import { EmailConstants } from '@modules/auth/domain/values-objects/email/EmailConstants';
import { UsernameConstants } from '@modules/auth/domain/values-objects/username/UsernameConstants';
import { UserEntity } from '../entities/user.entity';

interface UserModelType {
  prototype: {
    save: jest.Mock<Promise<void>>;
  };
  findOne: jest.Mock<
    {
      exec: jest.Mock<Promise<UserEntity | undefined>>;
    },
    [Record<string, any>]
  >;
}

type MockUserModel = UserModelType & {
  new (): UserModelType;
};

describe('MongooseUserRepository', () => {
  let repository: MongooseUserRepository;

  let userModel: jest.Mock<UserModelType> & MockUserModel;

  let mockedExecFindOne: jest.Mock;
  let mockedSavePrototype: jest.Mock;

  beforeEach(async () => {
    userModel = jest.fn() as unknown as jest.Mock<UserModelType, any, any> &
      UserModelType;

    mockedExecFindOne = jest.fn().mockResolvedValue(userLikeJSON());
    userModel.findOne = jest
      .fn()
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .mockImplementation((params: Record<string, any>) => ({
        exec: mockedExecFindOne,
      }));
    mockedSavePrototype = jest.fn().mockImplementation(() => undefined);
    userModel.prototype.save = mockedSavePrototype;

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: getModelToken(UserEntity.name),
          useValue: userModel,
        },
        MongooseUserRepository,
      ],
    }).compile();

    repository = module.get<MongooseUserRepository>(MongooseUserRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    const user = userLikeJSON();

    it('should create user', async () => {
      const response = await repository.create(user);

      expect(response).toBeUndefined();
      expect(userModel).toHaveBeenCalledWith(user);

      expect(mockedSavePrototype).toHaveBeenCalled();
    });

    it('should create multiple users', async () => {
      const usersToCreate = [];

      for (let i = 0; i <= 10; i++) {
        usersToCreate.push(userLikeJSON());
      }

      for (const user of usersToCreate) {
        repository.create(user);
        expect(userModel).toHaveBeenCalledWith(user);
        expect(mockedSavePrototype).toHaveBeenCalled();
      }
    });
  });

  describe('findOne', () => {
    const validEmail = EmailConstants.EXEMPLE;

    it('should return user with email passed', async () => {
      const response = await repository.findOne({ email: validEmail });

      expect(userModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(userLikeJSON());
      expect(response.email).toBe(validEmail);
    });

    it('should return undefined when not found user with email', async () => {
      mockedExecFindOne.mockImplementation(() => undefined);

      const response = await repository.findOne({
        email: 'emailnotfound@email.com',
      });

      expect(response).toBeUndefined();
    });
  });

  describe('findByUsername', () => {
    const validUsername = UsernameConstants.EXEMPLE;

    it('should return user with username passed', async () => {
      const response = await repository.findOne({ username: validUsername });

      expect(userModel.findOne).toHaveBeenCalled();
      expect(mockedExecFindOne).toHaveBeenCalledWith();
      expect(response).toEqual(userLikeJSON());
      expect(response.username).toBe(validUsername);
    });

    it('should return undefined when not found user with username', async () => {
      mockedExecFindOne.mockImplementation(() => undefined);

      const response = await repository.findOne({
        username: 'usernamenotfound',
      });

      expect(response).toBeUndefined();
    });
  });
});
