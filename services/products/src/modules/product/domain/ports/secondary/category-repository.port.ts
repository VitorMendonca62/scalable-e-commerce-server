import CategoryEntity from '@product/domain/entities/category.entity';
import { PublicCategory } from '@product/domain/types/category';

export interface CategoryRepository {
  create(category: PublicCategory): Promise<void>;
  findBySlug(slug: string): Promise<PublicCategory | null>;
  findAll(page: number): Promise<PublicCategory[]>;
  update(updates: Partial<CategoryEntity>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  exists(slug: string): Promise<boolean>;
}
