import {
  Controller,
  Post,
  Res,
  Headers,
  HttpStatus,
  Body,
  Param,
  Get,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import CreateProductDTO from '../dtos/create-product.dto';
import {
  NotFoundItem,
  NotPossible,
} from '@product/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@product/domain/ports/primary/http/sucess.port';
import ProductMapper from '@product/infrastructure/mappers/product.mapper';
import CreateProductUseCase from '@product/application/use-cases/create-product-use-case';
import GetProductUseCase from '@product/application/use-cases/get-product-use-case';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';

@Controller('product')
export default class ProductController {
  constructor(
    private readonly productMapper: ProductMapper,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
  ) {}

  @Post('/')
  async create(
    @Body() dto: CreateProductDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const useCaseResult = await this.createProductUseCase.execute(
      this.productMapper.createDTOForEntity(dto, userID),
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.BAD_REQUEST);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Produto criado com sucesso');
  }

  @Get('/:id')
  async getByID(
    @Param('id') productID,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const useCaseResult = await this.getProductUseCase.getByID(productID);

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason == ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.BAD_REQUEST);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse(
      'Produto encontrado com sucesso',
      useCaseResult.result,
    );
  }
}
