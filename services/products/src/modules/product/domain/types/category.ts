import CategoryModel from '@product/infrastructure/adaptars/secondary/database/models/categories.model';

export type PublicCategory = Pick<CategoryModel, 'publicID' | 'name'>;
