import CategoryEntity from '@product/domain/entities/category.entity';
import { PublicCategory } from '@product/domain/types/category';

export abstract class CategoryRepository {
  abstract create(category: PublicCategory): Promise<void>;
  abstract findAll(cursor?: string | null): Promise<[PublicCategory[], string]>;
  abstract update(updates: Partial<CategoryEntity>): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
}
