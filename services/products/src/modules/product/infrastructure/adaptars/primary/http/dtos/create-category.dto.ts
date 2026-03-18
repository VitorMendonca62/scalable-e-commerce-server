import { CategoryActive } from '../decorators/dtos/category/active.decorator';
import { CategoryName } from '../decorators/dtos/category/name.decorator';
import { CategorySlug } from '../decorators/dtos/category/slug.decorator';

export default class CreateCategoryDTO {
  @CategoryName()
  name: string;

  @CategorySlug()
  slug: string;

  @CategoryActive()
  active: boolean;
}
