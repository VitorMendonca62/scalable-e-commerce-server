import { UserRepository } from '@modules/user/domain/ports/secondary/user-repository.port';
import { UpdateUserUseCase } from './update-user.usecase';
import { UserMapper } from '@modules/user/infrastructure/mappers/user.mapper';
import { NotFoundItem } from '@modules/user/domain/ports/primary/http/error.port';
import { IDConstants } from '@modules/user/domain/values-objects/uuid/id-constants';
import {
  UserFactory,
  UserUpdateFactory,
} from '@modules/user/infrastructure/helpers/users/user-factory';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: UserRepository;
  let userMapper: UserMapper;

  beforeEach(async () => {
    userRepository = {
      update: jest.fn(),
      findOne: jest.fn(),
    } as any;

    userMapper = {
      userUpdateModelForJSON: jest.fn(),
    } as any;

    useCase = new UpdateUserUseCase(userRepository, userMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('execute', () => {
    const user = UserFactory.createEntity();
    const newUser = UserUpdateFactory.createEntity({
      username: 'usernameChange',
    });
    const userUpdated = UserFactory.createEntity({
      username: 'usernameChange',
    });
    const id = IDConstants.EXEMPLE;

    beforeEach(() => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);
      jest.spyOn(userRepository, 'update').mockResolvedValue(userUpdated);
      jest.spyOn(userMapper, 'userUpdateModelForJSON').mockReturnValue(newUser);
    });

    it('should return undefined on sucess', async () => {
      const response = await useCase.execute(id, newUser);

      expect(response).toEqual({
        name: userUpdated.name,
        username: userUpdated.username,
        email: userUpdated.email,
        avatar: userUpdated.avatar,
        phonenumber: userUpdated.phonenumber,
      });
    });

    it('should call repository with correct parameters ', async () => {
      await useCase.execute(id, newUser);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        userId: id,
      });

      expect(userRepository.update).toHaveBeenCalledWith(id, newUser);
    });

    it('should call mapper with correct parameters ', async () => {
      await useCase.execute(id, newUser);

      expect(userMapper.userUpdateModelForJSON).toHaveBeenCalledWith(newUser);
    });

    it('should throw not found item when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      await expect(useCase.execute(id, newUser)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });

    it('should throw not found item when user is not active', async () => {
      const user = UserFactory.createEntity({ active: false });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(user);

      await expect(useCase.execute(id, newUser)).rejects.toThrow(
        new NotFoundItem('Não foi possivel encontrar o usuário'),
      );
    });
  });
});
