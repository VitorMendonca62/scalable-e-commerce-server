import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import { GetUserUseCase } from './get-user.usecase';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import { IDValidator } from '@modules/user/domain/values-objects/uuid/id-validator';
import { NotFoundItem } from '@modules/user/domain/ports/primary/http/error.port';
import { UserFactory } from '@modules/user/infrastructure/helpers/users/user-factory';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/constants';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = { findOne: jest.fn() } as any;
    useCase = new GetUserUseCase(userRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = IDConstants.EXEMPLE;
    const username = UsernameConstants.EXEMPLE;
    const userWithId = UserFactory.createEntity();
    const userWithUsername = UserFactory.createEntity({
      username: 'teste1243',
    });

    jest.mock('@user/domain/values-objects/uuid/id-validator');

    beforeEach(() => {
      jest.spyOn(IDValidator, 'validate').mockImplementation(jest.fn());
    });

    it('should return the user data when a valid ID is provided', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(userWithId)
        .mockResolvedValueOnce(undefined);

      const response = await useCase.execute(id);
      expect(response).toEqual({
        name: userWithId.name,
        username: userWithId.username,
        email: userWithId.email,
        avatar: userWithId.avatar,
        phonenumber: userWithId.phonenumber,
      });
    });

    it('should throw not found user when active user is false and valid id is provided', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({ ...userWithId, active: false })
        .mockResolvedValueOnce(undefined);

      await expect(useCase.execute(id)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should throw not found user when not found user and id is provided', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce(undefined);

      await expect(useCase.execute(id)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should return the user data when a valid username is provided', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce(userWithUsername);

      const response = await useCase.execute(username);
      expect(response).toEqual({
        name: userWithUsername.name,
        username: userWithUsername.username,
        email: userWithUsername.email,
        avatar: userWithUsername.avatar,
        phonenumber: userWithUsername.phonenumber,
      });
    });

    it('should throw not found user when active user is false and valid username is provided', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValueOnce({...userWithUsername, active: false});

      await expect(useCase.execute(username)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should throw not found user when not found user and username is provided', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValueOnce(undefined);

      await expect(useCase.execute(username)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });
  });
});
