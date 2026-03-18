import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import { CartFactory } from '@product/infrastructure/helpers/factories/cart-factory';
import GetCartUseCase from './get-cart.usecase';

describe('GetCartUseCase', () => {
  let useCase: GetCartUseCase;
  let cartRepository: CartRepository;

  beforeEach(async () => {
    cartRepository = {
      getOne: vi.fn(),
    } as any;

    useCase = new GetCartUseCase(cartRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(cartRepository).toBeDefined();
  });

  describe('getByID', () => {
    const cartEntity = CartFactory.createEntity();
    const cartID = cartEntity.publicID;
    const userID = cartEntity.userID;
    const cartModel = CartFactory.createModel({
      publicID: cartID,
      userID,
      items: cartEntity.items,
    });
    const cart = {
      publicID: cartModel.publicID,
      items: cartModel.items,
      createdAt: cartModel.createdAt,
      updatedAt: cartModel.updatedAt,
    };

    beforeEach(() => {
      vi.spyOn(cartRepository, 'getOne').mockResolvedValue(cart);
    });

    it('should call getOne with cartID and userID', async () => {
      await useCase.getByID(cartID, userID);

      expect(cartRepository.getOne).toHaveBeenCalledWith(cartID, userID);
    });

    it('should return ok with cart on success', async () => {
      const result = await useCase.getByID(cartID, userID);

      expect(result).toEqual({
        ok: true,
        result: cart,
      });
    });

    it('should return NOT_FOUND when cart does not exist', async () => {
      vi.spyOn(cartRepository, 'getOne').mockResolvedValue(null);

      const result = await useCase.getByID(cartID, userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel encontrar o carrinho',
        reason: ApplicationResultReasons.NOT_FOUND,
      });
    });

    it('should return NOT_POSSIBLE when getOne throws error', async () => {
      vi.spyOn(cartRepository, 'getOne').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.getByID(cartID, userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel buscar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});