import UserRepository from '@modules/user/domain/ports/secondary/user-repository.port';
import { DeleteUserUseCase } from './delete-user.usecase';
import { IDConstants } from '@modules/user/domain/values-objects/common/constants';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: UserRepository;

  beforeEach(async () => {
    userRepository = {
      delete: vi.fn(),
    } as any;

    useCase = new DeleteUserUseCase(userRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('execute', () => {
    const userID = IDConstants.EXEMPLE;

    beforeEach(() => {
      vi.spyOn(userRepository, 'delete').mockResolvedValue(1);
    });

    it('should call userRepository.delete with correct parameters', async () => {
      await useCase.execute(userID);
      expect(userRepository.delete).toHaveBeenCalledWith(userID);
    });

    it('should return ok on sucess', async () => {
      const result = await useCase.execute(userID);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND with if row affected is 0', async () => {
      vi.spyOn(userRepository, 'delete').mockResolvedValue(0);

      const result = await useCase.execute(userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel encontrar o usuário',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should rethrow error if userRepository.delete throw error', async () => {
      vi.spyOn(userRepository, 'delete').mockRejectedValue(new Error('Error'));

      try {
        await useCase.execute(userID);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Error');
        expect(error.data).toBeUndefined();
      }
    });
  });
});
