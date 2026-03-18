import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  UpdateProductPort,
} from '@product/domain/ports/application/product/update-product.port';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import ProductModel from '@product/infrastructure/adaptars/secondary/database/models/product.model';

@Injectable()
export default class UpdateProductUseCase implements UpdateProductPort {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ): Promise<ExecuteReturn> {
    try {
      const result = await this.productRepository.update(
        productID,
        userID,
        updates,
      );

      if (!result) {
        return {
          ok: false,
          reason: ApplicationResultReasons.NOT_FOUND,
          message: 'Não foi possivel encontrar o produto',
        };
      }

      return {
        ok: true,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel atualizar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
