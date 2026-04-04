import { IDConstants } from '@user/domain/values-objects/common/constants';
import { UsernameConstants } from '@user/domain/values-objects/user/constants';
import {
  UserFactory,
  UserUpdateFactory,
} from '@user/infrastructure/helpers/users/factory';
import { UpdateUserUseCase } from './update-user.usecase';
import { ApplicationResultReasons } from '@user/domain/enums/application-result-reasons';
import UserRepository from '@user/domain/ports/secondary/user-repository.port';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: UserRepository;
  let userMapper: UserMapper;

  beforeEach(async () => {
    userRepository = {
      update: vi.fn(),
      findOneWithOR: vi.fn(),
      findOne: vi.fn(),
    } as any;

    userMapper = {
      updateEntityForObject: vi.fn(),
    } as any;

    useCase = new UpdateUserUseCase(userRepository, userMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('execute', () => {
    const userUpdate = UserUpdateFactory.createEntity({ username: undefined });
    const userUpdateModel = UserUpdateFactory.createModel({
      username: undefined,
    });
    const userID = IDConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);
      vi.spyOn(userRepository, 'update').mockResolvedValue(1);
      vi.spyOn(userMapper, 'updateEntityForObject').mockReturnValue(
        userUpdateModel,
      );
      vi.spyOn(userRepository, 'findOneWithOR').mockResolvedValue(undefined);
    });

    it('should call userMapper.updateEntityForObject with correct parameters', async () => {
      await useCase.execute(userID, userUpdate);

      expect(userMapper.updateEntityForObject).toHaveBeenCalledWith(userUpdate);
    });

    it('should call userRepository.update with correct parameters', async () => {
      await useCase.execute(userID, userUpdate);

      expect(userRepository.update).toHaveBeenCalledWith(
        userID,
        userUpdateModel,
      );
    });

    it('should call userRepository.findOneWithOR with correct parameters', async () => {
      const userUpdate = UserUpdateFactory.createEntity();
      await useCase.execute(userID, userUpdate);

      expect(userRepository.findOneWithOR).toHaveBeenCalledWith(
        [
          {
            username: userUpdate.username.getValue(),
          },
        ],
        true,
      );
    });

    it('should return ok on sucess', async () => {
      const result = await useCase.execute(userID, userUpdate);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return ok on sucess with username', async () => {
      const userUpdate = UserUpdateFactory.createEntity();
      const userUpdateModel = UserUpdateFactory.createModel();

      vi.spyOn(userMapper, 'updateEntityForObject').mockReturnValue(
        userUpdateModel,
      );
      const result = await useCase.execute(userID, userUpdate);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return ERROR_ALREADY_EXISTS with username if username is in use by another user', async () => {
      vi.spyOn(userRepository, 'findOneWithOR').mockResolvedValue(
        UserFactory.createModel({ userID: 'another-user-id' }),
      );

      const userUpdate = UserUpdateFactory.createEntity();
      const result = await useCase.execute(userID, userUpdate);

      expect(result).toEqual({
        ok: false,
        message: UsernameConstants.ERROR_ALREADY_EXISTS,
        result: 'username',
        reason: ApplicationResultReasons.FIELD_ALREADY_EXISTS,
      });
    });

    it('should allow username update when it belongs to the same user', async () => {
      vi.spyOn(userRepository, 'findOneWithOR').mockResolvedValue(
        UserFactory.createModel({ userID }),
      );

      const userUpdate = UserUpdateFactory.createEntity();
      const result = await useCase.execute(userID, userUpdate);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND with 0 row is affected', async () => {
      vi.spyOn(userRepository, 'update').mockResolvedValue(0);

      const result = await useCase.execute(userID, userUpdate);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return NOT_POSSIBLE if userRepository.findOneWithOR throw error', async () => {
      vi.spyOn(userRepository, 'findOneWithOR').mockRejectedValue(
        new Error('Error'),
      );
      const userUpdate = UserUpdateFactory.createEntity();

      const result = await useCase.execute(userID, userUpdate);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel atualizar o usuário',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if userRepository.update throw error', async () => {
      vi.spyOn(userRepository, 'update').mockRejectedValue(new Error('Error'));

      const result = await useCase.execute(userID, userUpdate);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel atualizar o usuário',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });

    it('should return NOT_POSSIBLE if userMapper.updateEntityForObject throw error', async () => {
      vi.spyOn(userMapper, 'updateEntityForObject').mockImplementation(() => {
        throw new Error('Error');
      });

      const result = await useCase.execute(userID, userUpdate);
      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel atualizar o usuário',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
