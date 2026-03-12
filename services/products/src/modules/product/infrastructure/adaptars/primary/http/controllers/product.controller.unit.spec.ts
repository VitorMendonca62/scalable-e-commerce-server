import CreateProductUseCase from '@product/application/use-cases/create-product-use-case';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  NotFoundItem,
  NotPossible,
} from '@product/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@product/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@product/domain/values-objects/constants';
import ProductMapper from '@product/infrastructure/mappers/product.mapper';
import { HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';
import ProductController from './product.controller';
import {
  ProductDTOFactory,
  ProductFactory,
} from '@product/infrastructure/helpers/factories/product-factory';
import GetProductUseCase from '@product/application/use-cases/get-product-use-case';
import UpdateProductUseCase from '@product/application/use-cases/update-product-use-case';

describe('ProductController', () => {
  let controller: ProductController;
  let productMapper: ProductMapper;
  let createProductUseCase: CreateProductUseCase;
  let getProductUseCase: GetProductUseCase;
  let updateProductUseCase: UpdateProductUseCase;
  let response: FastifyReply;

  beforeEach(async () => {
    productMapper = {
      createDTOForEntity: vi.fn(),
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

    controller = new ProductController(
      productMapper,
      createProductUseCase,
      getProductUseCase,
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

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
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

    beforeEach(() => {
      vi.spyOn(getProductUseCase, 'getByID').mockResolvedValue({
        ok: true,
        result: productModel,
      });
    });

    it('should call getProductUseCase.getByID with product ID', async () => {
      await controller.getByID(productID, response);

      expect(getProductUseCase.getByID).toHaveBeenCalledWith(productID);
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.getByID(productID, response);

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

      const result = await controller.getByID(productID, response);

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

      const result = await controller.getByID(productID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'ID inválido',
      });
    });

    it('should throw error if getProductUseCase throws error', async () => {
      vi.spyOn(getProductUseCase, 'getByID').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.getByID(productID, response);
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
    const dto = ProductDTOFactory.createUpdateProductDTO();

    beforeEach(() => {
      vi.spyOn(updateProductUseCase, 'execute').mockResolvedValue({
        ok: true,
      });
    });

    it('should call updateProductUseCase.execute with correct parameters', async () => {
      await controller.update(productID, dto, userID, response);

      expect(updateProductUseCase.execute).toHaveBeenCalledWith(
        productID,
        userID,
        dto,
      );
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

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
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
});
