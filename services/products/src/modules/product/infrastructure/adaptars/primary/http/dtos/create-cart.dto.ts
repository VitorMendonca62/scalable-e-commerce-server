import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class CartItemDTO {
  @IsNotEmpty()
  @IsUUID()
  productID: string;

  @IsInt()
  @Min(1)
  quantity: number;
}

export default class CreateCartDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDTO)
  items: CartItemDTO[];
}
