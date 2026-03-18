import { HttpStatus } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  NotPossible,
  NotFoundItem,
  FieldInvalid,
} from '@product/domain/ports/primary/http/error.port';
import { HttpOKResponse } from '@product/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@product/domain/values-objects/constants';
import { FastifyReply } from 'fastify';
import { FavoriteController } from './favorite.controller';
import FavoriteProductUseCase from '@product/application/use-cases/products/favorite-product-use-case';

describe('FavoriteController', () => {
  let controller: FavoriteController;
  let favoriteProductUseCase: FavoriteProductUseCase;
  let response: FastifyReply;

  beforeEach(async () => {
    favoriteProductUseCase = {
      favorite: vi.fn(),
      unfavorite: vi.fn(),
    } as any;

    controller = new FavoriteController(favoriteProductUseCase);

    response = {
      status: vi.fn(),
    } as any;
  });

  const userID = IDConstants.EXEMPLE;
  const productID = 'product-123';

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(favoriteProductUseCase).toBeDefined();
  });

  describe('favorite', () => {
    beforeEach(() => {
      vi.spyOn(favoriteProductUseCase, 'favorite').mockResolvedValue({
        ok: true,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.favorite(
        undefined as any,
        productID,
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

    it('should call favoriteProductUseCase.favorite with correct parameters', async () => {
      await controller.favorite(userID, productID, response);

      expect(favoriteProductUseCase.favorite).toHaveBeenCalledWith(
        productID,
        userID,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.favorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produto favoritado com sucesso',
      });
    });

    it('should return NotPossible on use case failure', async () => {
      vi.spyOn(favoriteProductUseCase, 'favorite').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Não foi possivel favoritar o produto',
      });

      const result = await controller.favorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possivel favoritar o produto',
      });
    });

    it('should throw error if favoriteProductUseCase throws error', async () => {
      vi.spyOn(favoriteProductUseCase, 'favorite').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.favorite(userID, productID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });

    it('should handle already favorited product gracefully', async () => {
      vi.spyOn(favoriteProductUseCase, 'favorite').mockResolvedValue({
        ok: true,
      });

      const result = await controller.favorite(userID, productID, response);

      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
    });

    it('should handle database errors via use case', async () => {
      vi.spyOn(favoriteProductUseCase, 'favorite').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro de conexão com banco de dados',
      });

      const result = await controller.favorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro de conexão com banco de dados',
      });
    });
  });

  describe('unfavorite', () => {
    beforeEach(() => {
      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockResolvedValue({
        ok: true,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.unfavorite(
        undefined as any,
        productID,
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

    it('should call favoriteProductUseCase.unfavorite with correct parameters', async () => {
      await controller.unfavorite(userID, productID, response);

      expect(favoriteProductUseCase.unfavorite).toHaveBeenCalledWith(
        productID,
        userID,
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.unfavorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Produto favoritado com sucesso',
      });
    });

    it('should return NotFoundItem when product was not favorited', async () => {
      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });

      const result = await controller.unfavorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Não foi possivel encontrar o produto',
      });
    });

    it('should return NotPossible on other failures', async () => {
      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao desfavoritar',
      });

      const result = await controller.unfavorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao desfavoritar',
      });
    });

    it('should throw error if favoriteProductUseCase throws error', async () => {
      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.unfavorite(userID, productID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });

    it('should handle NOT_FOUND reason specifically', async () => {
      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Favorito não existe',
      });

      const result = await controller.unfavorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
    });

    it('should handle database errors via use case', async () => {
      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro de conexão com banco de dados',
      });

      const result = await controller.unfavorite(userID, productID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro de conexão com banco de dados',
      });
    });

    it('should handle multiple unfavorite attempts', async () => {
      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockResolvedValue({
        ok: true,
      });
      const result1 = await controller.unfavorite(userID, productID, response);
      expect(result1).toBeInstanceOf(HttpOKResponse);

      vi.spyOn(favoriteProductUseCase, 'unfavorite').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Favorito não existe',
      });
      const result2 = await controller.unfavorite(userID, productID, response);
      expect(result2).toBeInstanceOf(NotFoundItem);
    });
  });
});
