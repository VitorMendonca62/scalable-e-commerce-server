import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import { CartFactory } from '@product/infrastructure/helpers/factories/cart-factory';
import GetCartsUseCase from './get-carts.usecase';

describe('GetCartsUseCase', () => {
  let useCase: GetCartsUseCase;
  let cartRepository: CartRepository;

  beforeEach(async () => {
    cartRepository = {
      findByUser: vi.fn(),
    } as any;

    useCase = new GetCartsUseCase(cartRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(cartRepository).toBeDefined();
  });

  describe('getByUser', () => {
    const userID = CartFactory.createEntity().userID;
    const carts = [CartFactory.createModel(), CartFactory.createModel()].map(
      ({ publicID, items, createdAt, updatedAt }) => ({
        publicID,
        items,
        createdAt,
        updatedAt,
      }),
    );

    beforeEach(() => {
      vi.spyOn(cartRepository, 'findByUser').mockResolvedValue(carts);
    });

    it('should call findByUser with userID', async () => {
      await useCase.getByUser(userID);

      expect(cartRepository.findByUser).toHaveBeenCalledWith(userID);
    });

    it('should return ok with carts on success', async () => {
      const result = await useCase.getByUser(userID);

      expect(result).toEqual({
        ok: true,
        result: carts,
      });
    });

    it('should return ok with empty array when user has no carts', async () => {
      vi.spyOn(cartRepository, 'findByUser').mockResolvedValue([]);

      const result = await useCase.getByUser(userID);

      expect(result).toEqual({
        ok: true,
        result: [],
      });
    });

    it('should return NOT_POSSIBLE when findByUser throws error', async () => {
      vi.spyOn(cartRepository, 'findByUser').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.getByUser(userID);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel buscar os carrinhos',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
