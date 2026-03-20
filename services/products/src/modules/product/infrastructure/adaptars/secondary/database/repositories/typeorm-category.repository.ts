import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import { MoreThan, Repository } from 'typeorm';
import CategoryModel from '../models/categories.model';
import CategoryEntity from '@product/domain/entities/category.entity';
import { PublicCategory } from '@product/domain/types/category';
import {
  CacheCategoryRepository,
  PublicCategoriesWithID,
} from '@product/domain/ports/secondary/cache-category-repository.port';

@Injectable()
export default class TypeOrmCategoryRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryModel)
    private categoryRepository: Repository<CategoryModel>,
    private cacheCategoryRepository: CacheCategoryRepository,
  ) {}

  async create(
    category: Omit<
      CategoryModel,
      'id' | 'createdAt' | 'updatedAt' | 'products'
    >,
  ): Promise<void> {
    await this.categoryRepository.save(category);
  }

  async findAll(cursor?: string): Promise<[PublicCategory[], string]> {
    cursor = cursor ?? '0';

    const cachedCategories =
      await this.cacheCategoryRepository.getCategories(cursor);

    if (cachedCategories !== null) {
      const nextCursor =
        cachedCategories.length === 25
          ? cachedCategories[24].id.toString()
          : null;

      const categories = cachedCategories.map(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ id, ...category }) => category,
      ) as PublicCategory[];

      return [categories, nextCursor];
    }

    const categories = (await this.categoryRepository.find({
      select: ['publicID', 'name', 'id'],
      where: {
        active: true,
        ...(cursor && { id: MoreThan(parseInt(cursor)) }),
      },
      order: { id: 'ASC' },
      take: 25,
    })) as unknown as PublicCategoriesWithID;

    const nextCursor =
      categories.length === 25 ? categories[24].id.toString() : null;

    await this.cacheCategoryRepository.add(cursor, categories);
    const categoriesWithouID = categories.map(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ({ id, ...category }) => category,
    );
    return [categoriesWithouID, nextCursor];
  }

  async update(category: Partial<CategoryEntity>): Promise<boolean> {
    const { publicID, ...updates } = category;

    const resultUpdate = await this.categoryRepository.update(
      { publicID },
      updates,
    );

    const wasUpdated = (resultUpdate.affected ?? 0) >= 1;

    if (!wasUpdated) return false;

    await this.cacheCategoryRepository.removeByPublicID(publicID);

    return true;
  }

  async delete(publicID: string): Promise<boolean> {
    const resultDelete = await this.categoryRepository.delete({ publicID });
    const result = (resultDelete.affected ?? 0) >= 1;

    if (result) await this.cacheCategoryRepository.removeByPublicID(publicID);

    return result;
  }
}
