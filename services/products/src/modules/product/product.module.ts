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
import TypeOrmProductRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-product.repository';
@Module({
  imports: [TypeOrmModule.forFeature([ProductModel])],
  controllers: [ProductController],
  providers: [
    ProductMapper,
    CreateProductUseCase,
    GetProductUseCase,
    UpdateProductUseCase,
    {
      provide: ProductRepository,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: EmailSender,
      useClass: NodemailerEmailSender,
    },
  ],
})
export class ProductModule {}
