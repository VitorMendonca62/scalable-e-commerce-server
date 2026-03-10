import {
  Controller,
  Post,
  Res,
  Headers,
  HttpStatus,
  Body,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import CreateProductDTO from '../dtos/create-product.dto';
import { NotPossible } from '@product/domain/ports/primary/http/error.port';
import { HttpCreatedResponse } from '@product/domain/ports/primary/http/sucess.port';
import ProductMapper from '@product/infrastructure/mappers/product.mapper';
import CreateProductUseCase from '@product/application/use-cases/create-product-use-case';

@Controller('product')
export default class ProductController {
  constructor(
    private readonly productMapper: ProductMapper,
    private readonly createProductUseCase: CreateProductUseCase,
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
}
