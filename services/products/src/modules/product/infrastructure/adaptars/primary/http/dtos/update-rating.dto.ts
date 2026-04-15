import { PartialType } from '@nestjs/mapped-types';
import CreateRatingDTO from './create-rating.dto';

export default class UpdateRatingDTO extends PartialType(CreateRatingDTO) {}
