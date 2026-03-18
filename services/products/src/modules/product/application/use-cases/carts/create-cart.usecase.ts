import CartEntity from '@product/domain/entities/cart.entity';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  CreateCartPort,
  ExecuteReturn,
} from '@product/domain/ports/application/cart/create-cart.port';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import CartMapper from '@product/infrastructure/mappers/cart.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class CreateCartUseCase implements CreateCartPort {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartMapper: CartMapper,
  ) {}

  async execute(cart: CartEntity): Promise<ExecuteReturn> {
    try {
      await this.cartRepository.add(this.cartMapper.entityForModel(cart));
      return { ok: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel criar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
