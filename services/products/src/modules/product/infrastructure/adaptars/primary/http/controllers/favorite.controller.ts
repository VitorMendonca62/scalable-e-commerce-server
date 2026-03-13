import {
  Controller,
  Param,
  Post,
  Res,
  Headers,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import FavoriteProductUseCase from '@product/application/use-cases/favorite-product-use-case';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  NotFoundItem,
  NotPossible,
} from '@product/domain/ports/primary/http/error.port';
import { HttpOKResponse } from '@product/domain/ports/primary/http/sucess.port';
import { FastifyReply } from 'fastify';

@Controller('favorite')
export class FavoriteController {
  constructor(
    private readonly favoriteProductUseCase: FavoriteProductUseCase,
  ) {}

  @Post('/:productId')
  async favorite(
    @Headers('x-user-id') userID: string,
    @Param('productId') productID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const useCaseResult = await this.favoriteProductUseCase.favorite(
      productID,
      userID,
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.BAD_REQUEST);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Produto favoritado com sucesso');
  }

  @Delete('/:productId')
  async unfavorite(
    @Headers('x-user-id') userID: string,
    @Param('productId') productID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const useCaseResult = await this.favoriteProductUseCase.unfavorite(
      productID,
      userID,
    );

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason == ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.BAD_REQUEST);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Produto favoritado com sucesso');
  }
}
