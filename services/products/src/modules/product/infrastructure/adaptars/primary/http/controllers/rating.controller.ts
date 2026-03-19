import {
  Body,
  Controller,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
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
import { FastifyReply } from 'fastify';
import CreateRatingDTO from '../dtos/create-rating.dto';

@Controller('rating')
export default class RatingController {
  constructor(
    private readonly createRatingUseCase: CreateRatingUseCase,
    private readonly updateRatingUseCase: UpdateRatingUseCase,
  ) {}

  @Post('/:productId')
  async create(
    @Param('productId') productID: string,
    @Body() dto: CreateRatingDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }

    const useCaseResult = await this.createRatingUseCase.execute(
      productID,
      userID,
      dto.value,
    );

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.ALREADY_EXISTS) {
        response.status(HttpStatus.CONFLICT);
        return new AlreadyExists(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Avaliação criada com sucesso');
  }

  @Patch('/:productId')
  async update(
    @Param('productId') productID: string,
    @Body() dto: CreateRatingDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }

    const useCaseResult = await this.updateRatingUseCase.execute(
      productID,
      userID,
      dto.value,
    );

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason === ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Avaliação atualizada com sucesso');
  }
}
