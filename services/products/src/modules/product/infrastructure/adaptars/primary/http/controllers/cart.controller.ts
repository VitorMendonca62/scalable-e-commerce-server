import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpStatus,
  Param,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
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
import CartMapper from '@product/infrastructure/mappers/cart.mapper';
import { FastifyReply } from 'fastify';
import CreateCartDTO from '../dtos/create-cart.dto';
import UpdateCartDTO from '../dtos/update-cart.dto';

@Controller('carts')
export default class CartController {
  constructor(
    private readonly cartMapper: CartMapper,
    private readonly createCartUseCase: CreateCartUseCase,
    private readonly getCartUseCase: GetCartUseCase,
    private readonly getCartsUseCase: GetCartsUseCase,
    private readonly updateCartUseCase: UpdateCartUseCase,
    private readonly deleteCartUseCase: DeleteCartUseCase,
  ) {}

  @Post('/')
  async create(
    @Body() dto: CreateCartDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }

    const useCaseResult = await this.createCartUseCase.execute(
      this.cartMapper.createDTOForEntity(dto, userID),
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Carrinho criado com sucesso');
  }

  @Get('/')
  async getByUser(
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }

    const useCaseResult = await this.getCartsUseCase.getByUser(userID);

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse(
      'Carrinhos encontrados com sucesso',
      useCaseResult.result,
    );
  }

  @Get('/:id')
  async getByID(
    @Param('id') cartID: string,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }

    const useCaseResult = await this.getCartUseCase.getByID(cartID, userID);

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
      'Carrinho encontrado com sucesso',
      useCaseResult.result,
    );
  }

  @Patch('/:id')
  async update(
    @Param('id') cartID: string,
    @Body() dto: UpdateCartDTO,
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
        'Adicione algum campo para o carrinho ser atualizado',
        'all',
      );
    }

    const useCaseResult = await this.updateCartUseCase.execute(
      cartID,
      userID,
      this.cartMapper.updateDTOToEntityPartial(dto),
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
    return new HttpOKResponse('Carrinho atualizado com sucesso');
  }

  @Delete('/:id')
  async delete(
    @Param('id') cartID: string,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    if (!userID) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid('Header x-user-id é obrigatório', 'x-user-id');
    }

    const useCaseResult = await this.deleteCartUseCase.execute(cartID, userID);

    if (useCaseResult.ok === false) {
      if (useCaseResult.reason == ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundItem(useCaseResult.message);
      }

      response.status(HttpStatus.INTERNAL_SERVER_ERROR);
      return new NotPossible(useCaseResult.message);
    }

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Carrinho deletado com sucesso');
  }
}
