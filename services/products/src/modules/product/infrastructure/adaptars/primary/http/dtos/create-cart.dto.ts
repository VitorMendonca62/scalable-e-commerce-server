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
  @IsNotEmpty({ message: 'O ID do produto é obrigatório' })
  @IsUUID('all', { message: 'O ID do produto deve ser um UUID válido' })
  productID: string;

  @IsNotEmpty({ message: 'A quantidade é obrigatório' })
  @IsInt({ message: 'A quantidade deve ser um inteiro' })
  @Min(1, { message: 'A quantidade deve ser no mínimo 1' })
  quantity: number;
}

export default class CreateCartDTO {
  @IsArray({ message: 'Items deve ser um array' })
  @ValidateNested({ each: true, message: 'Items devem ser válidos' })
  @Type(() => CartItemDTO)
  items: CartItemDTO[];
}
