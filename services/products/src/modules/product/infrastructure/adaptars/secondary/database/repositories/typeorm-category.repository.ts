import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryRepository } from '@product/domain/ports/secondary/category-repository.port';
import { And, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import CategoryModel from '../models/categories.model';
import CategoryEntity from '@product/domain/entities/category.entity';

@Injectable()
export default class TypeOrmCategoryRepository implements CategoryRepository {
  constructor(
    @InjectRepository(CategoryModel)
    private categoryRepository: Repository<CategoryModel>,
  ) {}

  async create(
    category: Omit<
      CategoryModel,
      'id' | 'createdAt' | 'updatedAt' | 'products'
    >,
  ): Promise<void> {
    await this.categoryRepository.save(category);
  }

  async findBySlug(slug: string): Promise<CategoryModel | null> {
    return await this.categoryRepository.findOne({
      where: { slug },
      select: ['id', 'name', 'slug', 'active', 'createdAt', 'updatedAt'],
    });
  }

  async findAll(page: number): Promise<CategoryModel[]> {
    return await this.categoryRepository.find({
      select: ['publicID', 'name', 'slug', 'active', 'createdAt', 'updatedAt'],
      where: { id: And(MoreThanOrEqual(page * 25), LessThan((page + 1) * 25)) },
      order: { id: 'ASC' },
    });
  }

  async update(category: Partial<CategoryEntity>): Promise<boolean> {
    const { publicID, ...updates } = category;
    const result = await this.categoryRepository.update({ publicID }, updates);
    return (result.affected ?? 0) >= 1;
  }

  async delete(publicID: string): Promise<boolean> {
    const result = await this.categoryRepository.delete({ publicID });
    return (result.affected ?? 0) >= 1;
  }

  async exists(slug: string): Promise<boolean> {
    return await this.categoryRepository.exists({ where: { slug } });
  }
}
