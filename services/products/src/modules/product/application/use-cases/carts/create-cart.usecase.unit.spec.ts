import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import { CartFactory } from '@product/infrastructure/helpers/factories/cart-factory';
import CartMapper from '@product/infrastructure/mappers/cart.mapper';
import CreateCartUseCase from './create-cart.usecase';

describe('CreateCartUseCase', () => {
  let useCase: CreateCartUseCase;
  let cartRepository: CartRepository;
  let cartMapper: CartMapper;

  beforeEach(async () => {
    cartRepository = {
      add: vi.fn(),
    } as any;

    cartMapper = {
      entityForModel: vi.fn(),
    } as any;

    useCase = new CreateCartUseCase(cartRepository, cartMapper);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
    expect(cartRepository).toBeDefined();
    expect(cartMapper).toBeDefined();
  });

  describe('execute', () => {
    const cartEntity = CartFactory.createEntity();
    const cartModel = CartFactory.createModel({
      publicID: cartEntity.publicID,
      userID: cartEntity.userID,
      items: cartEntity.items,
    });
    const mappedModel = {
      publicID: cartModel.publicID,
      userID: cartModel.userID,
      items: cartModel.items,
    };

    beforeEach(() => {
      vi.spyOn(cartMapper, 'entityForModel').mockReturnValue(mappedModel);
      vi.spyOn(cartRepository, 'add').mockResolvedValue(undefined);
    });

    it('should map entity to model', async () => {
      await useCase.execute(cartEntity);

      expect(cartMapper.entityForModel).toHaveBeenCalledWith(cartEntity);
    });

    it('should call add with mapped model', async () => {
      await useCase.execute(cartEntity);

      expect(cartRepository.add).toHaveBeenCalledWith(mappedModel);
    });

    it('should return ok on success', async () => {
      const result = await useCase.execute(cartEntity);

      expect(result).toEqual({
        ok: true,
      });
    });

    it('should return NOT_POSSIBLE when add throws error', async () => {
      vi.spyOn(cartRepository, 'add').mockRejectedValue(
        new Error('Database error'),
      );

      const result = await useCase.execute(cartEntity);

      expect(result).toEqual({
        ok: false,
        message: 'Não foi possivel criar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });
    });
  });
});
