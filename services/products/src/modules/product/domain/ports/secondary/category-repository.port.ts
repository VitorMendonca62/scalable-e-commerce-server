import CategoryEntity from '@product/domain/entities/category.entity';
import { PublicCategory } from '@product/domain/types/category';

export abstract class CategoryRepository {
  abstract create(category: PublicCategory): Promise<void>;
  abstract findBySlug(slug: string): Promise<PublicCategory | null>;
  abstract findAll(page: number): Promise<PublicCategory[]>;
  abstract update(updates: Partial<CategoryEntity>): Promise<boolean>;
  abstract delete(id: string): Promise<boolean>;
  abstract exists(slug: string): Promise<boolean>;
}
