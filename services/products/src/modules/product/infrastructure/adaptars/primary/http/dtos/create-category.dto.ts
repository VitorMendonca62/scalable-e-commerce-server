import { CategoryActive } from '../decorators/dtos/category/active.decorator';
import { CategoryName } from '../decorators/dtos/category/name.decorator';
export default class CreateCategoryDTO {
  @CategoryName()
  name: string;

  @CategoryActive()
  active: boolean;
}
