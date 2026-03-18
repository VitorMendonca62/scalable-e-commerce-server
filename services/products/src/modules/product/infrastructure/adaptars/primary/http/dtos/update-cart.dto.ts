import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CartItemDTO } from './create-cart.dto';

export default class UpdateCartDTO {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDTO)
  items?: CartItemDTO[];
}
