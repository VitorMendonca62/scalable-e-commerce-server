import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  GetProductPort,
} from '@product/domain/ports/application/get-product.port';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';

@Injectable()
export default class GetProductUseCase implements GetProductPort {
  constructor(private readonly productRepository: ProductRepository) {}

  async getByID(productID: string, userID: string): Promise<ExecuteReturn> {
    try {
      const product = await this.productRepository.getOne(productID, userID);

      if (product === null) {
        return {
          ok: false,
          reason: ApplicationResultReasons.NOT_FOUND,
          message: 'Não foi possivel encontrar o produto',
        };
      }

      return {
        ok: true,
        result: product,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel pegar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
