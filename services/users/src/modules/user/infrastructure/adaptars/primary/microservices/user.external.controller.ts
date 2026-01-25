import { CreateUserUseCase } from '@modules/user/application/use-cases/user/create-user.usecase';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { Body, Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { ApiCreateUser } from '../common/decorators/docs/user/api-create-user.decorator';
import { CreateUserDTO } from '../http/dtos/user/create-user.dto';
import { v4 } from 'uuid';

@Controller('user-external')
export default class UserExternalController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly userMapper: UserMapper
  ) {}
}
