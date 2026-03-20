import { PublicCategory } from '@product/domain/types/category';

export type PublicCategoriesWithID = (PublicCategory & { id: number })[];

export abstract class CacheCategoryRepository {
  abstract getCategories(
    cursor: string,
  ): Promise<PublicCategoriesWithID | null>;

  abstract add(
    cursor: string,
    categories: PublicCategoriesWithID,
  ): Promise<void>;

  abstract removeByPublicID(id: string): Promise<void>;
}
