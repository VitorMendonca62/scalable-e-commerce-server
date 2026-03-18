import { HttpStatus } from '@nestjs/common';
import CreateCartUseCase from '@product/application/use-cases/carts/create-cart.usecase';
import DeleteCartUseCase from '@product/application/use-cases/carts/delete-cart.usecase';
import GetCartUseCase from '@product/application/use-cases/carts/get-cart.usecase';
import GetCartsUseCase from '@product/application/use-cases/carts/get-carts.usecase';
import UpdateCartUseCase from '@product/application/use-cases/carts/update-cart.usecase';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  FieldInvalid,
  NotFoundItem,
  NotPossible,
} from '@product/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@product/domain/ports/primary/http/sucess.port';
import {
  CartDTOFactory,
  CartFactory,
} from '@product/infrastructure/helpers/factories/cart-factory';
import CartMapper from '@product/infrastructure/mappers/cart.mapper';
import { FastifyReply } from 'fastify';
import CartController from './cart.controller';

describe('CartController', () => {
  let controller: CartController;
  let cartMapper: CartMapper;
  let createCartUseCase: CreateCartUseCase;
  let getCartUseCase: GetCartUseCase;
  let getCartsUseCase: GetCartsUseCase;
  let updateCartUseCase: UpdateCartUseCase;
  let deleteCartUseCase: DeleteCartUseCase;
  let response: FastifyReply;

  beforeEach(async () => {
    cartMapper = {
      createDTOForEntity: vi.fn(),
      updateDTOToEntityPartial: vi.fn(),
    } as any;

    createCartUseCase = {
      execute: vi.fn(),
    } as any;

    getCartUseCase = {
      getByID: vi.fn(),
    } as any;

    getCartsUseCase = {
      getByUser: vi.fn(),
    } as any;

    updateCartUseCase = {
      execute: vi.fn(),
    } as any;

    deleteCartUseCase = {
      execute: vi.fn(),
    } as any;

    controller = new CartController(
      cartMapper,
      createCartUseCase,
      getCartUseCase,
      getCartsUseCase,
      updateCartUseCase,
      deleteCartUseCase,
    );

    response = {
      status: vi.fn(),
    } as any;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(cartMapper).toBeDefined();
    expect(createCartUseCase).toBeDefined();
    expect(getCartUseCase).toBeDefined();
    expect(getCartsUseCase).toBeDefined();
    expect(updateCartUseCase).toBeDefined();
    expect(deleteCartUseCase).toBeDefined();
  });

  describe('create', () => {
    const dto = CartDTOFactory.createCreateCartDTO();
    const userID = CartFactory.createEntity().userID;

    beforeEach(() => {
      vi.spyOn(createCartUseCase, 'execute').mockResolvedValue({ ok: true });
      vi.spyOn(cartMapper, 'createDTOForEntity').mockReturnValue(
        CartFactory.createEntity({ userID }),
      );
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.create(dto, '', response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Header x-user-id é obrigatório',
        data: 'x-user-id',
      });
    });

    it('should call createCartUseCase.execute with mapped entity', async () => {
      await controller.create(dto, userID, response);

      expect(cartMapper.createDTOForEntity).toHaveBeenCalledWith(dto, userID);
      expect(createCartUseCase.execute).toHaveBeenCalled();
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.create(dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Carrinho criado com sucesso',
      });
    });

    it('should return NotPossible when use case fails', async () => {
      vi.spyOn(createCartUseCase, 'execute').mockResolvedValue({
        ok: false,
        message: 'Erro ao criar',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });

      const result = await controller.create(dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao criar',
      });
    });
  });

  describe('getByUser', () => {
    const userID = CartFactory.createEntity().userID;
    const carts = [CartFactory.createModel()].map(
      ({ publicID, items, createdAt, updatedAt }) => ({
        publicID,
        items,
        createdAt,
        updatedAt,
      }),
    );

    beforeEach(() => {
      vi.spyOn(getCartsUseCase, 'getByUser').mockResolvedValue({
        ok: true,
        result: carts,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.getByUser('', response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
    });

    it('should call getCartsUseCase.getByUser with userID', async () => {
      await controller.getByUser(userID, response);

      expect(getCartsUseCase.getByUser).toHaveBeenCalledWith(userID);
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.getByUser(userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Carrinhos encontrados com sucesso',
        data: carts,
      });
    });

    it('should return NotPossible when use case fails', async () => {
      vi.spyOn(getCartsUseCase, 'getByUser').mockResolvedValue({
        ok: false,
        message: 'Erro ao buscar',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      });

      const result = await controller.getByUser(userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao buscar',
      });
    });
  });

  describe('getByID', () => {
    const cartEntity = CartFactory.createEntity();
    const cartID = cartEntity.publicID;
    const userID = cartEntity.userID;
    const cart = CartFactory.createModel({
      publicID: cartID,
      userID,
      items: cartEntity.items,
    });
    const cartResult = {
      publicID: cart.publicID,
      items: cart.items,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };

    beforeEach(() => {
      vi.spyOn(getCartUseCase, 'getByID').mockResolvedValue({
        ok: true,
        result: cartResult,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.getByID(cartID, '', response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
    });

    it('should call getCartUseCase.getByID with ids', async () => {
      await controller.getByID(cartID, userID, response);

      expect(getCartUseCase.getByID).toHaveBeenCalledWith(cartID, userID);
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.getByID(cartID, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Carrinho encontrado com sucesso',
        data: cartResult,
      });
    });

    it('should return NotFoundItem when cart is not found', async () => {
      vi.spyOn(getCartUseCase, 'getByID').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Carrinho não encontrado',
      });

      const result = await controller.getByID(cartID, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Carrinho não encontrado',
      });
    });

    it('should return NotPossible when use case fails', async () => {
      vi.spyOn(getCartUseCase, 'getByID').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao buscar',
      });

      const result = await controller.getByID(cartID, userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao buscar',
      });
    });
  });

  describe('update', () => {
    const cartEntity = CartFactory.createEntity();
    const cartID = cartEntity.publicID;
    const userID = cartEntity.userID;
    const dto = CartDTOFactory.createUpdateCartDTO({
      items: [CartDTOFactory.createCartItemDTO()],
    });

    beforeEach(() => {
      vi.spyOn(updateCartUseCase, 'execute').mockResolvedValue({ ok: true });
      vi.spyOn(cartMapper, 'updateDTOToEntityPartial').mockReturnValue({
        items: dto.items,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.update(cartID, dto, '', response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
    });

    it('should return FieldInvalid when dto is empty', async () => {
      const emptyDto = CartDTOFactory.createUpdateCartDTO();

      const result = await controller.update(
        cartID,
        emptyDto,
        userID,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Adicione algum campo para o carrinho ser atualizado',
        data: 'all',
      });
    });

    it('should call updateCartUseCase.execute with mapped updates', async () => {
      await controller.update(cartID, dto, userID, response);

      expect(cartMapper.updateDTOToEntityPartial).toHaveBeenCalledWith(dto);
      expect(updateCartUseCase.execute).toHaveBeenCalledWith(cartID, userID, {
        items: dto.items,
      });
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.update(cartID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Carrinho atualizado com sucesso',
      });
    });

    it('should return NotFoundItem when cart is not found', async () => {
      vi.spyOn(updateCartUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Carrinho não encontrado',
      });

      const result = await controller.update(cartID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Carrinho não encontrado',
      });
    });

    it('should return NotPossible when use case fails', async () => {
      vi.spyOn(updateCartUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao atualizar',
      });

      const result = await controller.update(cartID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao atualizar',
      });
    });
  });

  describe('delete', () => {
    const cartEntity = CartFactory.createEntity();
    const cartID = cartEntity.publicID;
    const userID = cartEntity.userID;

    beforeEach(() => {
      vi.spyOn(deleteCartUseCase, 'execute').mockResolvedValue({ ok: true });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.delete(cartID, '', response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
    });

    it('should call deleteCartUseCase.execute with ids', async () => {
      await controller.delete(cartID, userID, response);

      expect(deleteCartUseCase.execute).toHaveBeenCalledWith(cartID, userID);
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.delete(cartID, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Carrinho deletado com sucesso',
      });
    });

    it('should return NotFoundItem when cart is not found', async () => {
      vi.spyOn(deleteCartUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Carrinho não encontrado',
      });

      const result = await controller.delete(cartID, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Carrinho não encontrado',
      });
    });

    it('should return NotPossible when use case fails', async () => {
      vi.spyOn(deleteCartUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao deletar',
      });

      const result = await controller.delete(cartID, userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao deletar',
      });
    });
  });
});
