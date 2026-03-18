import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  UpdateCartPort,
} from '@product/domain/ports/application/cart/update-cart.port';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';
import CartModel from '@product/infrastructure/adaptars/secondary/database/models/cart.model';

@Injectable()
export default class UpdateCartUseCase implements UpdateCartPort {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(
    cartID: string,
    userID: string,
    updates: Partial<CartModel>,
  ): Promise<ExecuteReturn> {
    try {
      const updated = await this.cartRepository.update(cartID, userID, updates);

      if (!updated) {
        return {
          ok: false,
          reason: ApplicationResultReasons.NOT_FOUND,
          message: 'Não foi possivel encontrar o carrinho',
        };
      }

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel atualizar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
