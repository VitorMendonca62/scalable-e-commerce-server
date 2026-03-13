import { Module } from '@nestjs/common';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import ProductController from './infrastructure/adaptars/primary/http/controllers/product.controller';
import ProductMapper from './infrastructure/mappers/product.mapper';
import CreateProductUseCase from './application/use-cases/create-product-use-case';
import ProductModel from './infrastructure/adaptars/secondary/database/models/product.model';
import ProductRepository from './domain/ports/secondary/product-repository.port';
import GetProductUseCase from './application/use-cases/get-product-use-case';
import UpdateProductUseCase from './application/use-cases/update-product-use-case';
import ProductFavoriteModel from './infrastructure/adaptars/secondary/database/models/favorite.model';
import GetProductsUseCase from './application/use-cases/get-products-use-case';
import FavoriteProductUseCase from './application/use-cases/favorite-product-use-case';
import FavoriteRepository from './domain/ports/secondary/favorite-repository.port';
import TypeOrmFavoriteRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-favorite.repository';
import TypeOrmProductRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-product.repository';
import { FavoriteController } from './infrastructure/adaptars/primary/http/controllers/favorite.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ProductModel, ProductFavoriteModel])],
  controllers: [ProductController, FavoriteController],
  providers: [
    ProductMapper,
    CreateProductUseCase,
    GetProductUseCase,
    GetProductsUseCase,
    UpdateProductUseCase,
    FavoriteProductUseCase,
    {
      provide: ProductRepository,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: FavoriteRepository,
      useClass: TypeOrmFavoriteRepository,
    },
    {
      provide: EmailSender,
      useClass: NodemailerEmailSender,
    },
  ],
})
export class ProductModule {}
