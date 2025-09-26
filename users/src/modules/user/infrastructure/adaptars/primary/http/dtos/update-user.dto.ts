import { PartialType } from '@nestjs/swagger';
import { ApiAvatar } from '../../common/decorators/docs/dtos/user/api-avatar.decorator';
import { Avatar } from '../../common/decorators/dtos/user/avatar.decorator';
import { CreateUserDTO } from './create-user.dto';
import { IsOptional } from 'class-validator';

export class UpdateUserDTO extends PartialType(CreateUserDTO) {
  @Avatar()
  @ApiAvatar()
  @IsOptional()
  avatar?: string;
}
