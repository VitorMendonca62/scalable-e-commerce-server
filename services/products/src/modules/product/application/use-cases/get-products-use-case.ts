import { Injectable } from '@nestjs/common';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  ExecuteReturn,
  GetProductsPort,
  ProductFilters,
} from '@product/domain/ports/application/get-products.port';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';

@Injectable()
export default class GetProductsUseCase implements GetProductsPort {
  constructor(private readonly productRepository: ProductRepository) {}

  async getByFilter(filters: ProductFilters): Promise<ExecuteReturn> {
    try {
      const products = await this.productRepository.findWithFilters(filters);

      return {
        ok: true,
        result: products,
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel pegar os produtos',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
