import CategoryModel from '@product/infrastructure/adaptars/secondary/database/models/categories.model';

export type PublicCategory = Omit<
  CategoryModel,
  'id' | 'createdAt' | 'updatedAt' | 'products'
>;
