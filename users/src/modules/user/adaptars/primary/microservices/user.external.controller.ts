import { CreateUserUseCase } from '@modules/user/core/application/use-cases/create-user.usecase';
import { Body, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserMapper } from '../../mappers/user.mapper';

@Controller('user-external')
export default class UserExternalController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userMapper: UserMapper,
  ) {}

  @MessagePattern('auth-user-created')
  async create(@Body() dto: CreateUserDTO) {
    const user = this.userMapper.createDTOForEntity(dto);

    await this.createUserUseCase.execute(user);
  }
}
