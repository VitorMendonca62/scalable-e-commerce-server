import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Get,
  Param,
  Patch,
  Query,
  Headers,
} from '@nestjs/common';
import CreateProductUseCase from '@product/application/use-cases/products/create-product-use-case';
import GetProductUseCase from '@product/application/use-cases/products/get-product-use-case';
import GetProductsUseCase from '@product/application/use-cases/products/get-products-use-case';
import UpdateProductUseCase from '@product/application/use-cases/products/update-product-use-case';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import { PaymentTypes } from '@product/domain/enums/payments-types.enum';
import { ProductFilters } from '@product/domain/ports/application/product/get-products.port';
import {
  NotPossible,
  NotFoundItem,
  FieldInvalid,
} from '@product/domain/ports/primary/http/error.port';
import {
  HttpCreatedResponse,
  HttpOKResponse,
} from '@product/domain/ports/primary/http/sucess.port';
import {
  PriceConstants,
  StockConstants,
} from '@product/domain/values-objects/constants';
import ProductMapper from '@product/infrastructure/mappers/product.mapper';
import { FastifyReply } from 'fastify';
import CreateProductDTO from '../dtos/create-product.dto';
import UpdateProductDTO from '../dtos/update-product.dto';

@Controller('product')
export default class ProductController {
  constructor(
    private readonly productMapper: ProductMapper,
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductUseCase: GetProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
  ) {}

  @Post('/')
  async create(
    @Body() dto: CreateProductDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    // TODO COLOCAR ISSO NO TEST
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }
    const useCaseResult = await this.createProductUseCase.execute(
      this.productMapper.createDTOForEntity(dto, userID),
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Produto criado com sucesso');
  }

  @Get('/:id')
  async getByID(
    @Param('id') productID: string,
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-id') userID: string,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }
    const useCaseResult = await this.getProductUseCase.getByID(
      productID,
      userID,
    );

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason == ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse(
      'Produto encontrado com sucesso',
      useCaseResult.result,
    );
  }

  @Patch('/:id')
  async update(
    @Param('id') productID,
    @Body() dto: UpdateProductDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }

    if (Object.keys(dto).length === 0) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid(
        'Adicione algum campo para o produto ser atualizado',
        'all',
      );
    }

    const useCaseResult = await this.updateProductUseCase.execute(
      productID,
      userID,
      this.productMapper.updateDTOToEntityPartial(dto),
    );

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason == ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Produto atualizado com sucesso');
  }

  @Get('/filter')
  async getProductsByFilter(
    @Query('category') category: string | undefined,
    @Query('price') price: `${number}-${number}` | undefined,
    @Query('payments') payments: string | undefined,
    @Query('stock') stock: `${number}-${number}` | undefined,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const filters: ProductFilters = {};

    if (category !== undefined) {
      filters.categoryID = category?.split(',');
    }

    if (payments !== undefined) {
      filters.payments = payments?.split(',') as unknown as PaymentTypes[];
    }

    if (price !== undefined) {
      const priceSplited = price.split('-');
      filters.price = {
        min: Number(priceSplited[0]),
        max: Number(
          priceSplited[1] === '' ? PriceConstants.MAX_VALUE : priceSplited[1],
        ),
      };
    }
    if (stock !== undefined) {
      const stockSplited = stock.split('-');
      filters.stock = {
        min: Number(stockSplited[0]),
        max: Number(
          stockSplited[1] === '' ? StockConstants.MAX_VALUE : stockSplited[1],
        ),
      };
    }

    if (Object.keys(filters).length === 0) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(
        'Adicione algum filtro para que possa filtrar produtos',
      );
    }

    const useCaseResult = await this.getProductsUseCase.getByFilter(filters);

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse(
      'Produtos encontrados com sucesso',
      useCaseResult.result,
    );
  }
}
