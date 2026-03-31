import ProductRepository, {
  FindWithFiltersReturn,
  GetOneReturn,
} from '@product/domain/ports/secondary/product-repository.port';
import ProductModel from '../models/product.model';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  And,
  FindOptionsWhere,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
  ArrayContains,
  In,
} from 'typeorm';
import { ProductFilters } from '@product/domain/ports/application/product/get-products.port';
import ProductRatingModel from '../models/rating.model';
import { CacheProductRepository } from '@product/domain/ports/secondary/cache-product-repository.port';
import { CacheFavoritesRepository } from '@product/domain/ports/secondary/cache-favorite-repository.port';
import FavoriteRepository from '@product/domain/ports/secondary/favorite-repository.port';
@Injectable()
export default class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductModel)
    private productRepository: Repository<ProductModel>,
    private cacheProductRepository: CacheProductRepository,
    private cacheFavoritesRepository: CacheFavoritesRepository,
    private favoriteRepository: FavoriteRepository,
  ) {}

  async findWithFilters(
    filters: ProductFilters,
  ): Promise<FindWithFiltersReturn[]> {
    const cacheKey = this.buildFiltersCacheKey(filters);
    const cachedProducts =
      await this.cacheProductRepository.getProductsByFilters(cacheKey);

    if (cachedProducts !== null) return cachedProducts;

    const whereFilters: FindOptionsWhere<ProductModel> = { active: true };
    const limit = filters.limit;
    const cursor = filters.cursor;

    if (filters.categoryID !== undefined) {
      whereFilters.categoryID = In(filters.categoryID);
    }

    if (filters.price !== undefined) {
      whereFilters.price = And(
        MoreThanOrEqual(filters.price.min),
        LessThanOrEqual(filters.price.max),
      );
    }

    if (filters.stock !== undefined) {
      whereFilters.stock = And(
        MoreThanOrEqual(filters.stock.min),
        LessThanOrEqual(filters.stock.max),
      );
    }

    if (filters.payments !== undefined) {
      whereFilters.payments = ArrayContains(filters.payments);
    }

    whereFilters.id = MoreThan(cursor);

    const query = this.addRatingSelect(
      this.productRepository.createQueryBuilder('product').setFindOptions({
        where: whereFilters,
        select: [
          'publicID',
          'title',
          'price',
          'overview',
          'photos',
          'payments',
          'stock',
          'owner',
          'category',
          'createdAt',
          'updatedAt',
        ],
        order: { id: 'ASC' },
        take: limit,
      }),
    );

    query
      .leftJoin('product.category', 'category')
      .addSelect(['category.publicID', 'category.name']);

    const result = await query.getRawAndEntities();

    const products = result.entities.map((product, index) => ({
      ...product,
      rating: Number(result.raw[index]?.rating ?? 0),
    }));

    await this.cacheProductRepository.addProductsByFilters(cacheKey, products);

    return products;
  }

  async getOne(publicID: string, userID: string): Promise<GetOneReturn | null> {
    const cachedProduct =
      await this.cacheProductRepository.getProduct(publicID);

    if (cachedProduct !== null) {
      const isFavorited = await this.getIsFavorite(userID, publicID);
      return {
        ...cachedProduct,
        isFavorited,
      };
    }

    let query = this.productRepository
      .createQueryBuilder('product')
      .select([
        'product.publicID',
        'product.title',
        'product.price',
        'product.overview',
        'product.description',
        'product.photos',
        'product.payments',
        'product.stock',
        'product.owner',
        'product.category',
        'product.createdAt',
        'product.updatedAt',
      ])

      .where('product.active = :active AND product.public_id = :publicID', {
        active: true,
        publicID,
      });

    query
      .leftJoin('product.category', 'category')
      .addSelect(['category.publicID', 'category.name']);

    query = this.addRatingSelect(query);
    query = this.addFavoritedSelect(query, userID);
    const result = await query.getRawAndEntities();

    if (result.entities.length === 0) return null;

    const product = result.entities[0];
    const rating = Number(result.raw[0].rating);
    const isFavorited = Boolean(result.raw[0].isFavorited);

    await this.cacheProductRepository.addProduct({
      ...product,
      rating,
    });

    if (isFavorited) {
      await this.cacheFavoritesRepository.addFavorite(userID, publicID);
    } else {
      await this.cacheFavoritesRepository.removeFavorite(userID, publicID);
    }

    return {
      ...product,
      isFavorited,
      rating,
    };
  }

  async add(
    product: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt' | 'category'>,
  ): Promise<void> {
    await this.productRepository.save(product);
    await this.cacheProductRepository.invalidateAll();
  }

  async update(
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ): Promise<boolean> {
    const wasUpdated =
      (
        await this.productRepository.update(
          { publicID: productID, owner: userID },
          updates,
        )
      ).affected >= 1;

    if (wasUpdated) await this.cacheProductRepository.invalidateAll();

    return wasUpdated;
  }

  private buildFiltersCacheKey(filters: ProductFilters): string {
    const categoryIDs = filters.categoryID
      ? [...filters.categoryID].sort().join(',')
      : '';
    const payments = filters.payments
      ? [...filters.payments].sort().join(',')
      : '';
    const price = filters.price
      ? `${filters.price.min}-${filters.price.max}`
      : '';
    const stock = filters.stock
      ? `${filters.stock.min}-${filters.stock.max}`
      : '';
    const cursor = filters.cursor ?? '';
    const limit = filters.limit ?? '';

    return `cursor=${cursor}|limit=${limit}|category=${categoryIDs}|price=${price}|stock=${stock}|payments=${payments}`;
  }

  private async getIsFavorite(
    userID: string,
    productID: string,
  ): Promise<boolean> {
    const cached = await this.cacheFavoritesRepository.isFavorite(
      userID,
      productID,
    );

    if (cached !== null) return cached;

    const isFavorite = await this.favoriteRepository.isFavorite(
      productID,
      userID,
    );

    if (isFavorite) {
      await this.cacheFavoritesRepository.addFavorite(userID, productID);
    } else {
      await this.cacheFavoritesRepository.removeFavorite(userID, productID);
    }

    return isFavorite;
  }

  private addRatingSelect(
    query: SelectQueryBuilder<ProductModel>,
  ): SelectQueryBuilder<ProductModel> {
    return query
      .leftJoin(
        ProductRatingModel,
        'rating',
        'rating.product_id = product.public_id',
      )
      .addSelect('COALESCE(AVG(rating.value), 0)', 'rating')
      .groupBy('product.id')
      .addGroupBy('category.id')
      .addGroupBy('favorite.id');
  }

  private addFavoritedSelect(
    query: SelectQueryBuilder<ProductModel>,
    userID: string,
  ): SelectQueryBuilder<ProductModel> {
    query
      .leftJoin(
        'product_favorites',
        'favorite',
        'favorite.product_id = product.public_id AND favorite.user_id = :userID',
        { userID },
      )
      .addSelect(
        'CASE WHEN favorite.id IS NOT NULL THEN true ELSE false END',
        'isFavorited',
      );
    return query;
  }
}
