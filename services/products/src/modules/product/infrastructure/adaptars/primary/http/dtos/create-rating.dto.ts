import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export default class CreateRatingDTO {
  @IsInt({ message: 'O valor da avaliação deve ser um inteiro' })
  @Min(1, { message: 'O valor da avaliação deve ser no mínimo 1' })
  @Max(5, { message: 'O valor da avaliação deve ser no máximo 5' })
  @IsNotEmpty({ message: 'O valor da avaliação é obrigatório' })
  value: number;

  @IsOptional()
  @IsString({ message: 'O comentário deve ser um texto' })
  @IsNotEmpty({ message: 'O comentário não pode ser vazio' })
  comment?: string;

  @Transform(({ value }) => {
    if (!Array.isArray(value)) {
      return value;
    }

    return value.map((item) =>
      Buffer.isBuffer(item) ? item.toString('base64') : item,
    );
  })
  @IsOptional()
  @ArrayMaxSize(2, { message: 'O máximo de imagens permitido é 2' })
  @IsArray({ message: 'As imagens devem ser um array' })
  @IsString({ each: true, message: 'As imagens devem ser base64' })
  images?: string[];
}
