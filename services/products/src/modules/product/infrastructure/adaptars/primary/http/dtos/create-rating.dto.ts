import { IsInt, IsNotEmpty, Max, Min } from 'class-validator';

export default class CreateRatingDTO {
  @IsInt({ message: 'O valor da avaliação deve ser um inteiro' })
  @Min(1, { message: 'O valor da avaliação deve ser no mínimo 1' })
  @Max(5, { message: 'O valor da avaliação deve ser no máximo 5' })
  @IsNotEmpty({ message: 'O valor da avaliação é obrigatório' })
  value: number;
}
