import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import { CartFactory } from '@product/infrastructure/helpers/factories/cart-factory';
import DeleteCartUseCase from './delete-cart.usecase';

describe('DeleteCartUseCase', () => {
  let useCase: DeleteCartUseCase;
  let cartRepository: CartRepository;

  beforeEach(async () => {
    cartRepository = {
      delete: vi.fn(),
    } as any;

    useCase = new DeleteCartUseCase(cartRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(cartRepository).toBeDefined();
  });

  describe('execute', () => {
    const cartEntity = CartFactory.createEntity();
    const cartID = cartEntity.publicID;
    const userID = cartEntity.userID;

    beforeEach(() => {
      vi.spyOn(cartRepository, 'delete').mockResolvedValue(true);
    });

    it('should call delete with cartID and userID', async () => {
      await useCase.execute(cartID, userID);

      expect(cartRepository.delete).toHaveBeenCalledWith(cartID, userID);
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(cartID, userID);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND when cart does not exist', async () => {
      vi.spyOn(cartRepository, 'delete').mockResolvedValue(false);

      const result = await useCase.execute(cartID, userID);

      expect(result).toEqual({
        ok: false,
        message: 'Carrinho não encontrado',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return NOT_POSSIBLE when delete throws error', async () => {
      vi.spyOn(cartRepository, 'delete').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(cartID, userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possível deletar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
