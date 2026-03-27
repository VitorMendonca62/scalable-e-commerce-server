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
  IDConstants,
  PriceConstants,
  StockConstants,
  TitleConstants,
} from '@product/domain/values-objects/constants';
import ProductMapper from '@product/infrastructure/mappers/product.mapper';
import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import ProductController from './product.controller';
import {
  ProductDTOFactory,
  ProductFactory,
} from '@product/infrastructure/helpers/factories/product-factory';
import CreateProductUseCase from '@product/application/use-cases/products/create-product-use-case';
import GetProductUseCase from '@product/application/use-cases/products/get-product-use-case';
import GetProductsUseCase from '@product/application/use-cases/products/get-products-use-case';
import UpdateProductUseCase from '@product/application/use-cases/products/update-product-use-case';

describe('ProductController', () => {
  let controller: ProductController;
  let productMapper: ProductMapper;
  let createProductUseCase: CreateProductUseCase;
  let getProductUseCase: GetProductUseCase;
  let updateProductUseCase: UpdateProductUseCase;
  let getProductsUseCase: GetProductsUseCase;
  let response: FastifyReply;

  beforeEach(async () => {
    productMapper = {
      createDTOForEntity: vi.fn(),
      updateDTOToEntityPartial: vi.fn(),
    } as any;

    createProductUseCase = {
      execute: vi.fn(),
    } as any;

    getProductUseCase = {
      getByID: vi.fn(),
    } as any;

    updateProductUseCase = {
      execute: vi.fn(),
    } as any;

    getProductsUseCase = {
      getByFilter: vi.fn(),
    } as any;

    controller = new ProductController(
      productMapper,
      createProductUseCase,
      getProductUseCase,
      getProductsUseCase,
      updateProductUseCase,
    );

    response = {
      status: vi.fn(),
    } as any;
  });

  const userID = IDConstants.EXEMPLE;

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(productMapper).toBeDefined();
    expect(createProductUseCase).toBeDefined();
    expect(getProductUseCase).toBeDefined();
    expect(updateProductUseCase).toBeDefined();
    expect(getProductsUseCase).toBeDefined();
  });

  describe('create', () => {
    const dto = ProductFactory.createDTO();
    const productEntity = ProductFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(productMapper, 'createDTOForEntity').mockReturnValue(
        productEntity,
      );

      vi.spyOn(createProductUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.create(dto, undefined as any, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Header x-user-id é obrigatório',
        data: 'x-user-id',
      });
    });

    it('should call createProductUseCase.execute with mapped entity', async () => {
      await controller.create(dto, userID, response);

      expect(productMapper.createDTOForEntity).toHaveBeenCalledWith(
        dto,
        userID,
      );
      expect(createProductUseCase.execute).toHaveBeenCalledWith(productEntity);
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.create(dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Produto criado com sucesso',
      });
    });

    it('should return NotPossible on failure', async () => {
      vi.spyOn(createProductUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Dados inválidos',
      });

      const result = await controller.create(dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Dados inválidos',
      });
    });

    it('should throw error if createProductUseCase throws error', async () => {
      vi.spyOn(createProductUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.create(dto, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });

    it('should throw error if productMapper.createDTOForEntity throws error', async () => {
      vi.spyOn(productMapper, 'createDTOForEntity').mockImplementation(() => {
        throw new Error('Erro no mapper');
      });

      try {
        await controller.create(dto, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no mapper');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('getByID', () => {
    const productID = IDConstants.EXEMPLE;
    const productModel = ProductFactory.createModel();
    const userID = `user${IDConstants.EXEMPLE}`;

    beforeEach(() => {
      vi.spyOn(getProductUseCase, 'getByID').mockResolvedValue({
        ok: true,
        result: productModel,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.getByID(
        productID,
        response,
        undefined as any,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Header x-user-id é obrigatório',
        data: 'x-user-id',
      });
    });

    it('should call getProductUseCase.getByID with product ID', async () => {
      await controller.getByID(productID, response, userID);

      expect(getProductUseCase.getByID).toHaveBeenCalledWith(productID, userID);
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.getByID(productID, response, userID);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produto encontrado com sucesso',
        data: productModel,
      });
    });

    it('should return NotFoundItem when product is not found', async () => {
      vi.spyOn(getProductUseCase, 'getByID').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Produto não encontrado',
      });

      const result = await controller.getByID(productID, response, userID);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Produto não encontrado',
      });
    });

    it('should return NotPossible on other failures', async () => {
      vi.spyOn(getProductUseCase, 'getByID').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'ID inválido',
      });

      const result = await controller.getByID(productID, response, userID);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'ID inválido',
      });
    });

    it('should throw error if getProductUseCase throws error', async () => {
      vi.spyOn(getProductUseCase, 'getByID').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.getByID(productID, response, userID);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('update', () => {
    const productID = IDConstants.EXEMPLE;
    const userID = IDConstants.EXEMPLE;
    const dto = ProductDTOFactory.createUpdateProductDTO({
      title: TitleConstants.EXEMPLE,
    });
    const productEntity = ProductFactory.createEntity();

    beforeEach(() => {
      vi.spyOn(updateProductUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
      vi.spyOn(productMapper, 'updateDTOToEntityPartial').mockReturnValue(
        productEntity,
      );
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.update(
        productID,
        dto,
        undefined as any,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Header x-user-id é obrigatório',
        data: 'x-user-id',
      });
    });

    it('should call updateProductUseCase.execute with correct parameters', async () => {
      await controller.update(productID, dto, userID, response);

      expect(updateProductUseCase.execute).toHaveBeenCalledWith(
        productID,
        userID,
        productEntity,
      );
    });

    it('should return FieldInvalid when no have fields in dto', async () => {
      const result = await controller.update(productID, {}, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Adicione algum campo para o produto ser atualizado',
        data: 'all',
      });
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.update(productID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produto atualizado com sucesso',
      });
    });

    it('should return NotFoundItem when product is not found', async () => {
      vi.spyOn(updateProductUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Produto não encontrado',
      });

      const result = await controller.update(productID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Produto não encontrado',
      });
    });

    it('should return NotPossible on other failures', async () => {
      vi.spyOn(updateProductUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Dados inválidos',
      });

      const result = await controller.update(productID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Dados inválidos',
      });
    });

    it('should throw error if updateProductUseCase throws error', async () => {
      vi.spyOn(updateProductUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.update(productID, dto, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
        expect(error.data).toBeUndefined();
      }
    });
  });

  describe('getProductsByFilter', () => {
    const mockProducts = [
      ProductFactory.createModel(),
      ProductFactory.createModel({ title: 'Product 2' }),
    ];
    const defaultPagination = { limit: 25 };

    beforeEach(() => {
      vi.spyOn(getProductsUseCase, 'getByFilter').mockResolvedValue({
        ok: true,
        result: mockProducts,
      });
    });

    it('should call getProductsUseCase.getByFilter with correct parameters', async () => {
      const category = 'electronics,smartphones';
      const price = '1000-5000';
      const payments = 'pix,credit_card';
      const stock = '10-100';

      await controller.getProductsByFilter(
        category,
        price,
        payments,
        stock,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics', 'smartphones'],
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: ['pix', 'credit_card'],
        ...defaultPagination,
      });
    });

    it('should apply pagination and cap limit to 100', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '10-100',
        '25',
        '200',
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: ['pix'],
        cursor: 25,
        limit: 100,
      });
    });

    it('should not set cursor when query is undefined', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: ['pix'],
        limit: 25,
      });
    });

    it('should return HttpOKResponse with products on success', async () => {
      const result = await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produtos encontrados com sucesso',
        data: mockProducts,
      });
    });

    it('should handle empty max price (use MAX_VALUE)', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-' as any,
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: PriceConstants.MAX_VALUE },
        stock: { min: 10, max: 100 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle empty max stock (use MAX_VALUE)', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '10-' as any,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: StockConstants.MAX_VALUE },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle empty min price (use 0)', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '-111' as any,
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 0, max: 111 },
        stock: { min: 10, max: 100 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle empty max stock (use 0)', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '-10' as any,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
        stock: { min: 0, max: 10 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle both empty min values', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '-1000' as any,
        'pix',
        '-10' as any,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 0, max: 1000 },
        stock: { min: 0, max: 10 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle both empty max values', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-' as any,
        'pix',
        '10-' as any,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: PriceConstants.MAX_VALUE },
        stock: { min: 10, max: StockConstants.MAX_VALUE },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle both empty max and min values', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '-' as any,
        'pix',
        '-' as any,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 0, max: PriceConstants.MAX_VALUE },
        stock: { min: 0, max: StockConstants.MAX_VALUE },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle multiple categories', async () => {
      await controller.getProductsByFilter(
        'electronics,smartphones,accessories',
        '1000-5000',
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics', 'smartphones', 'accessories'],
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle multiple payment methods', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix,credit_card,debit_card,boleto',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: ['pix', 'credit_card', 'debit_card', 'boleto'],
        ...defaultPagination,
      });
    });

    it('should handle single category', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 1000, max: 5000 },
        stock: { min: 10, max: 100 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle minimum price and stock values', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '0-1000',
        'pix',
        '0-50',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 0, max: 1000 },
        stock: { min: 0, max: 50 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should handle large price and stock ranges', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '100000-999999',
        'pix',
        '1000-10000',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        price: { min: 100000, max: 999999 },
        stock: { min: 1000, max: 10000 },
        payments: ['pix'],
        ...defaultPagination,
      });
    });

    it('should return NotPossible on use case failure', async () => {
      vi.spyOn(getProductsUseCase, 'getByFilter').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Parâmetros inválidos',
      });

      const result = await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Parâmetros inválidos',
      });
    });

    it('should throw error if getProductsUseCase throws error', async () => {
      vi.spyOn(getProductsUseCase, 'getByFilter').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.getProductsByFilter(
          'electronics',
          '1000-5000',
          'pix',
          '10-100',
          undefined,
          undefined,
          response,
        );
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });

    it('should parse price range correctly', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '5000-10000',
        'pix',
        '10-100',
        undefined,
        undefined,
        response,
      );

      const callArgs = (getProductsUseCase.getByFilter as any).mock.calls[0][0];

      expect(callArgs.price).toEqual({ min: 5000, max: 10000 });
      expect(typeof callArgs.price.min).toBe('number');
      expect(typeof callArgs.price.max).toBe('number');
    });

    it('should parse stock range correctly', async () => {
      await controller.getProductsByFilter(
        'electronics',
        '1000-5000',
        'pix',
        '50-200',
        undefined,
        undefined,
        response,
      );

      const callArgs = (getProductsUseCase.getByFilter as any).mock.calls[0][0];

      expect(callArgs.stock).toEqual({ min: 50, max: 200 });
      expect(typeof callArgs.stock.min).toBe('number');
      expect(typeof callArgs.stock.max).toBe('number');
    });

    it('should return empty array when no products match filter', async () => {
      vi.spyOn(getProductsUseCase, 'getByFilter').mockResolvedValue({
        ok: true,
        result: [],
      });

      const result = await controller.getProductsByFilter(
        'nonexistent',
        '1000000-2000000',
        'pix',
        '1000-2000',
        undefined,
        undefined,
        response,
      );

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produtos encontrados com sucesso',
        data: [],
      });
    });

    it('should filter only by category when other params are undefined', async () => {
      await controller.getProductsByFilter(
        'electronics',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        categoryID: ['electronics'],
        ...defaultPagination,
      });
    });

    it('should filter only by price when other params are undefined', async () => {
      await controller.getProductsByFilter(
        undefined,
        '1000-5000',
        undefined,
        undefined,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        price: { min: 1000, max: 5000 },
        ...defaultPagination,
      });
    });

    it('should filter only by payments when other params are undefined', async () => {
      await controller.getProductsByFilter(
        undefined,
        undefined,
        'pix,credit_card',
        undefined,
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        payments: ['pix', 'credit_card'],
        ...defaultPagination,
      });
    });

    it('should filter only by stock when other params are undefined', async () => {
      await controller.getProductsByFilter(
        undefined,
        undefined,
        undefined,
        '10-100',
        undefined,
        undefined,
        response,
      );

      expect(getProductsUseCase.getByFilter).toHaveBeenCalledWith({
        stock: { min: 10, max: 100 },
        ...defaultPagination,
      });
    });

    it('should send empty filters object when all params are undefined', async () => {
      const result = await controller.getProductsByFilter(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Adicione algum filtro para que possa filtrar produtos',
      });
      expect(getProductsUseCase.getByFilter).not.toHaveBeenCalled();
    });

    it('should return products when filtering with partial filters', async () => {
      const result = await controller.getProductsByFilter(
        'electronics',
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produtos encontrados com sucesso',
        data: mockProducts,
      });
    });

    it('should return empty array when no products match partial filters', async () => {
      vi.spyOn(getProductsUseCase, 'getByFilter').mockResolvedValue({
        ok: true,
        result: [],
      });

      const result = await controller.getProductsByFilter(
        undefined,
        undefined,
        undefined,
        '10000-20000',
        undefined,
        undefined,
        response,
      );

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produtos encontrados com sucesso',
        data: [],
      });
    });
  });
});
