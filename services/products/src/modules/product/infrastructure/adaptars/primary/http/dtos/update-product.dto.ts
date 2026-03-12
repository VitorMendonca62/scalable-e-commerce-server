import { PartialType } from '@nestjs/mapped-types';
import CreateProductDTO from './create-product.dto';

export default class UpdateProductDTO extends PartialType(CreateProductDTO) {}
