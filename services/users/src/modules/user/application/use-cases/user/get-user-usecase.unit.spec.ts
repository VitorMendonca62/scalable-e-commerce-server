import { UserFactory } from '@modules/user/infrastructure/helpers/users/factory';
import { UsernameConstants } from '@modules/user/domain/values-objects/user/constants';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';
import UserRepository from '@modules/user/domain/ports/secondary/user-repository.port';
import { GetUserUseCase } from './get-user.usecase';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = {
      findOne: vi.fn(),
    } as any;
    useCase = new GetUserUseCase(userRepository);
  });

  it('should be defined', () => {
    expect(userRepository).toBeDefined();
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userID = IDConstants.EXEMPLE;
    const username = UsernameConstants.EXEMPLE;
    const user = UserFactory.createModel();

    beforeEach(() => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(user);
    });

    it('should call userRepository.findOne with userID when field is userID', async () => {
      await useCase.execute(userID, 'userID');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        userID,
      });
    });

    it('should call userRepository.findOne with username when field is username', async () => {
      await useCase.execute(username, 'username');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        username,
      });
    });
    it('should return ok and user on sucess', async () => {
      const result = await useCase.execute(username, 'username');

      expect(result).toEqual({
        ok: true,
        result: {
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          phoneNumber: user.phoneNumber,
        },
      });
    });

    it('should return NOT_FOUND with if not find user', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(undefined);

      const result = await useCase.execute(username, 'username');

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return NOT_FOUND with if user is deleted', async () => {
      vi.spyOn(userRepository, 'findOne').mockResolvedValue(
        UserFactory.createModel({ deletedAt: new Date() }),
      );

      const result = await useCase.execute(username, 'username');

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should rethrow error if userRepository.findOne throw error', async () => {
      vi.spyOn(userRepository, 'findOne').mockRejectedValue(new Error('Error'));

      try {
        await useCase.execute(username, 'username');
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
