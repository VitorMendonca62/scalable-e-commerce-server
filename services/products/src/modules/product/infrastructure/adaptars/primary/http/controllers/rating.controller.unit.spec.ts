import { HttpStatus } from '@nestjs/common';
import CreateRatingUseCase from '@product/application/use-cases/ratings/create-rating.usecase';
import UpdateRatingUseCase from '@product/application/use-cases/ratings/update-rating.usecase';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  AlreadyExists,
  FieldInvalid,
  NotFoundItem,
  NotPossible,
} from '@product/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@product/domain/ports/primary/http/sucess.port';
import { IDConstants } from '@product/domain/values-objects/constants';
import RatingMapper from '@product/infrastructure/mappers/rating.mapper';
import { FastifyReply } from 'fastify';
import CreateRatingDTO from '../dtos/create-rating.dto';
import UpdateRatingDTO from '../dtos/update-rating.dto';
import RatingController from './rating.controller';

describe('RatingController', () => {
  let controller: RatingController;
  let createRatingUseCase: CreateRatingUseCase;
  let updateRatingUseCase: UpdateRatingUseCase;
  let ratingMapper: RatingMapper;
  let response: FastifyReply;

  beforeEach(() => {
    createRatingUseCase = {
      execute: vi.fn(),
    } as any;

    updateRatingUseCase = {
      execute: vi.fn(),
    } as any;

    ratingMapper = {
      createDTOForEntity: vi.fn(),
      updateDTOToModelPartial: vi.fn(),
    } as any;

    controller = new RatingController(
      ratingMapper,
      createRatingUseCase,
      updateRatingUseCase,
    );

    response = {
      status: vi.fn(),
    } as any;
  });

  const userID = IDConstants.EXEMPLE;
  const productID = 'product-123';
  const dto: CreateRatingDTO = {
    value: 4,
    comment: 'Produto excelente',
    images: ['aW1hZ2Ux', 'aW1hZ2Uy'],
  } as any;
  const updateDto: UpdateRatingDTO = {
    comment: 'Comentário atualizado',
    images: ['aW1hZ2Ux'],
  } as any;

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(createRatingUseCase).toBeDefined();
    expect(updateRatingUseCase).toBeDefined();
  });

  describe('create', () => {
    beforeEach(() => {
      vi.spyOn(createRatingUseCase, 'execute').mockResolvedValue({ ok: true });
      vi.spyOn(ratingMapper, 'createDTOForEntity').mockReturnValue({
        productID,
        userID,
        value: dto.value,
      } as any);
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.create(
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

    it('should call createRatingUseCase.execute with rating entity', async () => {
      const ratingEntity = { productID, userID, value: dto.value } as any;
      vi.spyOn(ratingMapper, 'createDTOForEntity').mockReturnValue(
        ratingEntity,
      );

      await controller.create(productID, dto, userID, response);

      expect(ratingMapper.createDTOForEntity).toHaveBeenCalledWith(
        dto,
        productID,
        userID,
      );
      expect(createRatingUseCase.execute).toHaveBeenCalledWith(ratingEntity);
    });

    it('should return HttpCreatedResponse on success', async () => {
      const result = await controller.create(productID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(result).toBeInstanceOf(HttpCreatedResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.CREATED,
        message: 'Avaliação criada com sucesso',
      });
    });

    it('should return AlreadyExists when rating already exists', async () => {
      vi.spyOn(createRatingUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.ALREADY_EXISTS,
        message: 'Avaliação já existe',
      });

      const result = await controller.create(productID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(result).toBeInstanceOf(AlreadyExists);
      expect(result).toEqual({
        statusCode: HttpStatus.CONFLICT,
        message: 'Avaliação já existe',
      });
    });

    it('should return NotPossible on use case failure', async () => {
      vi.spyOn(createRatingUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Não foi possível criar a avaliação',
      });

      const result = await controller.create(productID, dto, userID, response);

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Não foi possível criar a avaliação',
      });
    });

    it('should throw error if use case throws error', async () => {
      vi.spyOn(createRatingUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.create(productID, dto, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });
  });

  describe('update', () => {
    beforeEach(() => {
      vi.spyOn(updateRatingUseCase, 'execute').mockResolvedValue({ ok: true });
      vi.spyOn(ratingMapper, 'updateDTOToModelPartial').mockReturnValue({
        comment: updateDto.comment,
        images: updateDto.images,
      });
    });

    it('should return FieldInvalid when x-user-id header is missing', async () => {
      const result = await controller.update(
        productID,
        updateDto,
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

    it('should return FieldInvalid no have fields', async () => {
      const result = await controller.update(productID, {}, userID, response);

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Adicione algum campo para a avaliação ser atualizada',
        data: 'all',
      });
    });

    it('should return FieldInvalid no have fields', async () => {
      const result = await controller.update(
        productID,
        undefined as any,
        userID,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(result).toBeInstanceOf(FieldInvalid);
      expect(result).toEqual({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Adicione algum campo para a avaliação ser atualizada',
        data: 'all',
      });
    });

    it('should call updateRatingUseCase.execute with correct parameters', async () => {
      await controller.update(productID, updateDto, userID, response);

      expect(ratingMapper.updateDTOToModelPartial).toHaveBeenCalledWith(
        updateDto,
      );
      expect(updateRatingUseCase.execute).toHaveBeenCalledWith(
        productID,
        userID,
        {
          comment: updateDto.comment,
          images: updateDto.images,
        },
      );
    });

    it('should return HttpOKResponse on success', async () => {
      const result = await controller.update(
        productID,
        updateDto,
        userID,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.OK);
      expect(result).toBeInstanceOf(HttpOKResponse);
      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Avaliação atualizada com sucesso',
      });
    });

    it('should return NotFoundItem when rating is not found', async () => {
      vi.spyOn(updateRatingUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Avaliação não encontrada',
      });

      const result = await controller.update(
        productID,
        updateDto,
        userID,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(result).toBeInstanceOf(NotFoundItem);
      expect(result).toEqual({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Avaliação não encontrada',
      });
    });

    it('should return NotPossible on other failures', async () => {
      vi.spyOn(updateRatingUseCase, 'execute').mockResolvedValue({
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Erro ao atualizar avaliação',
      });

      const result = await controller.update(
        productID,
        updateDto,
        userID,
        response,
      );

      expect(response.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(result).toBeInstanceOf(NotPossible);
      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Erro ao atualizar avaliação',
      });
    });

    it('should throw error if use case throws error', async () => {
      vi.spyOn(updateRatingUseCase, 'execute').mockRejectedValue(
        new Error('Erro no use case'),
      );

      try {
        await controller.update(productID, updateDto, userID, response);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('Erro no use case');
      }
    });
  });
});
