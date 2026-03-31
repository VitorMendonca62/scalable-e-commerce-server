import { Module } from '@nestjs/common';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import ProductController from './infrastructure/adaptars/primary/http/controllers/product.controller';
import CartController from './infrastructure/adaptars/primary/http/controllers/cart.controller';
import RatingController from './infrastructure/adaptars/primary/http/controllers/rating.controller';
import ProductMapper from './infrastructure/mappers/product.mapper';
import CartMapper from './infrastructure/mappers/cart.mapper';
import CreateProductUseCase from './application/use-cases/products/create-product-use-case';
import CreateCartUseCase from './application/use-cases/carts/create-cart.usecase';
import ProductModel from './infrastructure/adaptars/secondary/database/models/product.model';
import CartModel from './infrastructure/adaptars/secondary/database/models/cart.model';
import ProductRepository from './domain/ports/secondary/product-repository.port';
import CartRepository from './domain/ports/secondary/cart-repository.port';
import GetProductUseCase from './application/use-cases/products/get-product-use-case';
import GetCartUseCase from './application/use-cases/carts/get-cart.usecase';
import UpdateProductUseCase from './application/use-cases/products/update-product-use-case';
import UpdateCartUseCase from './application/use-cases/carts/update-cart.usecase';
import ProductFavoriteModel from './infrastructure/adaptars/secondary/database/models/favorite.model';
import ProductRatingModel from './infrastructure/adaptars/secondary/database/models/rating.model';
import GetProductsUseCase from './application/use-cases/products/get-products-use-case';
import GetCartsUseCase from './application/use-cases/carts/get-carts.usecase';
import FavoriteProductUseCase from './application/use-cases/products/favorite-product-use-case';
import DeleteCartUseCase from './application/use-cases/carts/delete-cart.usecase';
import CreateRatingUseCase from './application/use-cases/ratings/create-rating.usecase';
import UpdateRatingUseCase from './application/use-cases/ratings/update-rating.usecase';
import FavoriteRepository from './domain/ports/secondary/favorite-repository.port';
import TypeOrmFavoriteRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-favorite.repository';
import TypeOrmProductRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-product.repository';
import TypeOrmCartRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-cart.repository';
import TypeOrmRatingRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-rating.repository';
import { FavoriteController } from './infrastructure/adaptars/primary/http/controllers/favorite.controller';
import CreateCategoryUseCase from './application/use-cases/category/create-category.usecase';
import GetCategoriesUseCase from './application/use-cases/category/get-categories.usecase';
import UpdateCategoryUseCase from './application/use-cases/category/update-category.usecase';
import DeleteCategoryUseCase from './application/use-cases/category/delete-category.usecase';
import TypeOrmCategoryRepository from './infrastructure/adaptars/secondary/database/repositories/typeorm-category.repository';
import { CategoryRepository } from './domain/ports/secondary/category-repository.port';
import CategoryModel from './infrastructure/adaptars/secondary/database/models/categories.model';
import CategoryController from './infrastructure/adaptars/primary/http/controllers/category.controller';
import CategoryMapper from './infrastructure/mappers/category.mapper';
import RatingRepository from './domain/ports/secondary/rating-repository.port';
import { CacheCategoryRepository } from './domain/ports/secondary/cache-category-repository.port';
import RedisCacheCategoryRepository from './infrastructure/adaptars/secondary/database/repositories/redis-cache-category.repository';
import { CacheProductRepository } from './domain/ports/secondary/cache-product-repository.port';
import RedisCacheProductRepository from './infrastructure/adaptars/secondary/database/repositories/redis-cache-product.repository';
import { CacheFavoritesRepository } from './domain/ports/secondary/cache-favorite-repository.port';
import RedisCacheFavoriteRepository from './infrastructure/adaptars/secondary/database/repositories/redis-cache-favorite.repository';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProductModel,
      ProductFavoriteModel,
      CartModel,
      CategoryModel,
      ProductRatingModel,
    ]),
  ],
  controllers: [
    ProductController,
    FavoriteController,
    CartController,
    CategoryController,
    RatingController,
  ],
  providers: [
    ProductMapper,
    CartMapper,
    CategoryMapper,
    CreateProductUseCase,
    CreateCartUseCase,
    CreateCategoryUseCase,
    GetProductUseCase,
    GetCartUseCase,
    GetProductsUseCase,
    GetCartsUseCase,
    GetCategoriesUseCase,
    UpdateProductUseCase,
    UpdateCartUseCase,
    UpdateCategoryUseCase,
    UpdateCategoryUseCase,
    FavoriteProductUseCase,
    DeleteCartUseCase,
    DeleteCategoryUseCase,
    CreateRatingUseCase,
    UpdateRatingUseCase,
    {
      provide: ProductRepository,
      useClass: TypeOrmProductRepository,
    },
    {
      provide: CartRepository,
      useClass: TypeOrmCartRepository,
    },
    {
      provide: CategoryRepository,
      useClass: TypeOrmCategoryRepository,
    },
    {
      provide: FavoriteRepository,
      useClass: TypeOrmFavoriteRepository,
    },
    {
      provide: RatingRepository,
      useClass: TypeOrmRatingRepository,
    },
    {
      provide: EmailSender,
      useClass: NodemailerEmailSender,
    },
    {
      provide: CacheCategoryRepository,
      useClass: RedisCacheCategoryRepository,
    },
    {
      provide: CacheProductRepository,
      useClass: RedisCacheProductRepository,
    },
    {
      provide: CacheFavoritesRepository,
      useClass: RedisCacheFavoriteRepository,
    },
  ],
})
export class ProductModule {}
