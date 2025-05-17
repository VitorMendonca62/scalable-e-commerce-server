import { CreateUserUseCase } from '@modules/user/core/application/use-cases/create-user.usecase';
import { Body, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserMapper } from '../../../core/application/mappers/user.mapper';
import { ApiCreateUser } from '../common/decorators/docs/api-create-user.decorator';

@Controller('user-external')
export default class UserExternalController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userMapper: UserMapper,
  ) {}

  @ApiCreateUser()
  @MessagePattern('auth-user-created')
  async create(@Body() dto: CreateUserDTO) {
    console.log(dto);
    const user = this.userMapper.createDTOForEntity(dto);

    await this.createUserUseCase.execute(user);
  }
}
