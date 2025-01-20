import { UserMapper } from '@auth/adaptars/mappers/user.mapper';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { CreateUserUseCase } from '@auth/core/application/use-cases/create-user.usecase';
import { LoginUserDTO } from './dto/login-user.dto';
import { CreateSessionUseCase } from '@modules/auth/core/application/use-cases/create-session.usecase';

@Controller('auth')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
  ) {}

  @Post('/register')
  @HttpCode(201)
  async create(@Body() dto: CreateUserDTO) {
    const user = this.userMapper.createDTOForEntity(dto);

    await this.createUserUseCase.execute(user);

    return {
      message: 'Usuário criado com sucesso',
      data: undefined,
    };
  }

  @Post('/login')
  @HttpCode(201)
  async login(@Body() dto: LoginUserDTO) {
    const user = this.userMapper.loginDTOForEntity(dto);

    return {
      message: 'Usuário realizou login com sucesso',
      data: await this.createSessionUseCase.execute(user),
    };
  }

  @Post()
  @HttpCode(200)
  async refreshToken(/* @Body() refreshToken: string */) {}
}
