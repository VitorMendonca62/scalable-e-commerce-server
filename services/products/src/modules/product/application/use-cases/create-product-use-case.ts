import ProductEntity from '@product/domain/entities/product.entity';
import { ApplicationResultReasons } from '@product/domain/enums/application-result-reasons';
import {
  CreateProductPort,
  ExecuteReturn,
} from '@product/domain/ports/application/create-product.port';
import ProductRepository from '@product/domain/ports/secondary/product-repository.port';
import ProductMapper from '@product/infrastructure/mappers/product.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export default class CreateProductUseCase implements CreateProductPort {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
  ) {}

  async execute(product: ProductEntity): Promise<ExecuteReturn> {
    try {
      await this.productRepository.add(
        this.productMapper.entityForModel(product),
      );
      return { ok: true };
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_) {
      return {
        ok: false,
        message: 'Não foi possivel criar o produto',
        reason: ApplicationResultReasons.NOT_POSSIBLE,
      };
    }
  }
}
