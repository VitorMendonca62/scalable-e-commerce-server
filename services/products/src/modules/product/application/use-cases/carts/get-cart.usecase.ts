import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  GetCartPort,
} from '@product/domain/ports/application/cart/get-cart.port';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';

@Injectable()
export default class GetCartUseCase implements GetCartPort {
  constructor(private readonly cartRepository: CartRepository) {}

  async getByID(cartID: string, userID: string): Promise<ExecuteReturn> {
    try {
      const cart = await this.cartRepository.getOne(cartID, userID);

      if (cart === null) {
        return {
          ok: false,
          message: 'Não foi possivel encontrar o carrinho',
          reason: ApplicationResultReasons.NOT_FOUND,
        };
      }

      return {
        ok: true,
        result: cart,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel buscar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
