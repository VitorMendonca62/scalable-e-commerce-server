import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateUserDTO } from './create-user.dto';
import { IsOptional } from 'class-validator';
import {
  ApiAvatar,
  Avatar,
} from '../../../common/decorators/dtos/user/decorators';

export class UpdateUserDTO extends PartialType(
  OmitType(CreateUserDTO, ['password'] as const),
) {
  @Avatar()
  @ApiAvatar()
  @IsOptional()
  avatar?: string;
}
