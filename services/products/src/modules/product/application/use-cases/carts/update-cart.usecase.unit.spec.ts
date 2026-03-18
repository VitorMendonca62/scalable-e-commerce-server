import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import { CartFactory } from '@product/infrastructure/helpers/factories/cart-factory';
import UpdateCartUseCase from './update-cart.usecase';

describe('UpdateCartUseCase', () => {
  let useCase: UpdateCartUseCase;
  let cartRepository: CartRepository;

  beforeEach(async () => {
    cartRepository = {
      update: vi.fn(),
    } as any;

    useCase = new UpdateCartUseCase(cartRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(cartRepository).toBeDefined();
  });

  describe('execute', () => {
    const cartEntity = CartFactory.createEntity();
    const cartID = cartEntity.publicID;
    const userID = cartEntity.userID;
    const updates = {
      items: [CartFactory.createItem({ quantity: 2 })],
    };

    beforeEach(() => {
      vi.spyOn(cartRepository, 'update').mockResolvedValue(true);
    });

    it('should call update with cartID, userID and updates', async () => {
      await useCase.execute(cartID, userID, updates);

      expect(cartRepository.update).toHaveBeenCalledWith(
        cartID,
        userID,
        updates,
      );
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(cartID, userID, updates);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_FOUND when cart does not exist', async () => {
      vi.spyOn(cartRepository, 'update').mockResolvedValue(false);

      const result = await useCase.execute(cartID, userID, updates);

      expect(result).toEqual({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o carrinho',
      });
    });

    it('should return NOT_POSSIBLE when update throws error', async () => {
      vi.spyOn(cartRepository, 'update').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(cartID, userID, updates);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel atualizar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
