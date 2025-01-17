import { UserMapper } from '@modules/user/adaptars/mappers/user.mapper';
import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { LoginUserDTO } from '../dto/login-user.dto';
import { TokenUserUseCase } from '@modules/user/core/application/use-cases/token-user.usecase';

@Controller('auth')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class SessionController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly tokenUserUseCase: TokenUserUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async login(@Body() dto: LoginUserDTO) {
    const entity = this.userMapper.loginDTOForEntity(dto);

    return {
      message: 'Login realizado com sucesso',
      data: await this.tokenUserUseCase.login(entity),
    };
  }

  @Post()
  @HttpCode(200)
  async refreshToken(@Body() refreshToken: string) {}
}
