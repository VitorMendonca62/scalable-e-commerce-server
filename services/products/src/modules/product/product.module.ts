import { Module } from '@nestjs/common';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import ProductController from './infrastructure/adaptars/primary/http/controllers/product.controller';
import ProductMapper from './infrastructure/mappers/product.mapper';
import CreateProductUseCase from './application/use-cases/create-product-use-case';
import ProductModel from './infrastructure/adaptars/secondary/database/models/product.model';
import ProductRepository from './domain/ports/secondary/product-repository.port';
@Module({
  imports: [TypeOrmModule.forFeature([ProductModel])],

  controllers: [ProductController],
  providers: [
    ProductMapper,
    CreateProductUseCase,
    {
      provide: ProductRepository,
      useClass: NodemailerEmailSender,
    },
    {
      provide: EmailSender,
      useClass: NodemailerEmailSender,
    },
  ],
})
export class ProductModule {}
