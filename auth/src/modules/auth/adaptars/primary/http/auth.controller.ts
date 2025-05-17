import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';
import { CreateUserUseCase } from '@auth/core/application/use-cases/create-user.usecase';
import { LoginUserDTO } from './dtos/login-user.dto';
import { CreateSessionUseCase } from '@modules/auth/core/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@modules/auth/core/application/use-cases/get-access-token';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateUser } from './decorators/docs/api-create-user.decorator';
import { ApiLoginUser } from './decorators/docs/api-login-user.decorator';
import { ApiGetAccessToken } from './decorators/docs/api-get-access-token-user.decorator';
import { UserMapper } from '@modules/auth/core/application/mappers/user.mapper';
import { PubSubMessageBroker } from '@modules/auth/core/domain/types/message-broker/pub-sub';
import { defaultRoles } from '@modules/auth/core/domain/types/permissions';

@Controller('auth')
@ApiTags('auth')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
    private readonly messageBrokerService: PubSubMessageBroker,
  ) {}

  @Post('/register')
  @HttpCode(201)
  @ApiCreateUser()
  async create(@Body() dto: CreateUserDTO) {
    this.messageBrokerService.publish(
      'user-created',
      {
        // Muda
        _id: '1',
        roles: defaultRoles,
        email: dto.email,
        name: dto.name,
        username: dto.username,
        phonenumber: dto.phonenumber,
      },
      'auth',
    );

    await this.createUserUseCase.execute(
      this.userMapper.createDTOForEntity(dto),
    );

    return {
      message: 'Usuário criado com sucesso',
      data: undefined,
    };
  }

  @Post('/login')
  @HttpCode(201)
  @ApiLoginUser()
  async login(@Body() dto: LoginUserDTO) {
    const user = this.userMapper.loginDTOForEntity(dto);

    return {
      message: 'Usuário realizou login com sucesso',
      data: await this.createSessionUseCase.execute(user),
    };
  }

  @Get('/token')
  @HttpCode(200)
  @ApiGetAccessToken()
  async getAccessToken(@Headers('authorization') refreshToken: string) {
    if (!refreshToken) {
      throw new ForbiddenException('Você não tem permissão');
    }
    if (refreshToken.split(' ')[0] != 'Bearer') {
      throw new ForbiddenException('Você não tem permissão');
    }

    refreshToken = refreshToken.split(' ')[1];

    return {
      messase: 'Aqui está seu token de acesso',
      data: await this.getAccessTokenUseCase.execute(refreshToken),
    };
  }
}
