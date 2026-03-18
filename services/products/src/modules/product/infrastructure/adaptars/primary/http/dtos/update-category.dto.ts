import { PartialType } from '@nestjs/mapped-types';
import CreateCategoryDTO from './create-category.dto';

export default class UpdateCategoryDTO extends PartialType(CreateCategoryDTO) {}
