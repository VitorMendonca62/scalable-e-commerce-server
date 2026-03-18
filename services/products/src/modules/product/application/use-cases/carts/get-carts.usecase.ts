import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  GetCartsPort,
} from '@product/domain/ports/application/cart/get-carts.port';
import CartRepository from '@product/domain/ports/secondary/cart-repository.port';

@Injectable()
export default class GetCartsUseCase implements GetCartsPort {
  constructor(private readonly cartRepository: CartRepository) {}

  async getByUser(userID: string): Promise<ExecuteReturn> {
    try {
      const carts = await this.cartRepository.findByUser(userID);

      return {
        ok: true,
        result: carts,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel buscar os carrinhos',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
