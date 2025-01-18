import { UserMapper } from '@auth/adaptars/mappers/user.mapper';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
// import { LoginUserDTO } from './dto/login-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { CreateUserUseCase } from '@auth/core/application/use-cases/create-user.usecase';

@Controller('auth')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createUserUseCase: CreateUserUseCase,
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

  @Post()
  @HttpCode(201)
  async login(/* @Body() dto: LoginUserDTO */) {
    return 'Hello world';
  }

  @Post()
  @HttpCode(200)
  async refreshToken(/* @Body() refreshToken: string */) {}
}
