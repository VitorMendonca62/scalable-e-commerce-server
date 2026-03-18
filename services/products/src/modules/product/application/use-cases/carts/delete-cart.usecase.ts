import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  DeleteCartPort,
  ExecuteReturn,
} from '@product/domain/ports/application/cart/delete-cart.port';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';

@Injectable()
export default class DeleteCartUseCase implements DeleteCartPort {
  constructor(private readonly cartRepository: CartRepository) {}

  async execute(cartID: string, userID: string): Promise<ExecuteReturn> {
    try {
      const deleted = await this.cartRepository.delete(cartID, userID);

      if (!deleted) {
        return {
          ok: false,
          message: 'Carrinho não encontrado',
          reason: ApplicationResultReasons.NOT_FOUND,
        };
      }

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possível deletar o carrinho',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
