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
@Injectable()
export default class TypeOrmProductRepository implements ProductRepository {
  constructor(
    @InjectRepository(ProductModel)
    private productRepository: Repository<ProductModel>,
  ) {}

  async findWithFilters(
    filters: ProductFilters,
  ): Promise<FindWithFiltersReturn[]> {
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

    return result.entities.map((product, index) => ({
      ...product,
      rating: Number(result.raw[index]?.rating ?? 0),
    }));
  }

  async getOne(publicID: string, userID: string): Promise<GetOneReturn | null> {
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
    return {
      ...product,
      isFavorited: result.raw[0].isFavorited,
      rating: Number(result.raw[0].rating),
    };
  }

  async add(
    product: Omit<ProductModel, 'id' | 'createdAt' | 'updatedAt' | 'category'>,
  ): Promise<void> {
    await this.productRepository.save(product);
  }

  async update(
    productID: string,
    userID: string,
    updates: Partial<ProductModel>,
  ): Promise<boolean> {
    return (
      (
        await this.productRepository.update(
          { publicID: productID, owner: userID },
          updates,
        )
      ).affected >= 1
    );
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
