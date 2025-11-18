import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { CreateUserDTO } from './dtos/create-user.dto';

import { LoginUserDTO } from './dtos/login-user.dto';
import { CreateSessionUseCase } from '@modules/auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@modules/auth/application/use-cases/get-access-token';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateUser } from './decorators/docs/api-create-user.decorator';
import { ApiLoginUser } from './decorators/docs/api-login-user.decorator';
import { ApiGetAccessToken } from './decorators/docs/api-get-access-token-user.decorator';

import { defaultRoles } from '@modules/auth/domain/types/permissions';
import { CreateUserUseCase } from '@modules/auth/application/use-cases/create-user.usecase';
import { UserMapper } from '@modules/auth/infrastructure/mappers/user.mapper';
import {
  HttpCreatedResponse,
  HttpOKResponse,
  HttpResponseOutbound,
} from '@modules/auth/domain/ports/primary/http/sucess.port';
import { AuthorizationToken } from './decorators/getValue/authorization-token.decorator';
import { BearerTokenPipe } from '@common/pipes/bearer-token.pipe';
import { UsersQueueService } from '../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
    private readonly usersQueueService: UsersQueueService,
  ) {}

  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateUser()
  async create(@Body() dto: CreateUserDTO): Promise<HttpResponseOutbound> {
    await this.createUserUseCase.execute(
      this.userMapper.createDTOForEntity(dto),
    );

    this.usersQueueService.send('user-created', {
      userID: '1',
      roles: defaultRoles,
      email: dto.email,
      name: dto.name,
      username: dto.username,
      phonenumber: dto.phonenumber,
    });

    return new HttpCreatedResponse('Usuário criado com sucesso');
  }

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  @ApiLoginUser()
  async login(@Body() dto: LoginUserDTO): Promise<HttpResponseOutbound> {
    return new HttpCreatedResponse(
      'Usuário realizou login com sucesso',
      await this.createSessionUseCase.execute(
        this.userMapper.loginDTOForEntity(dto),
      ),
    );
  }

  @Get('/token')
  @HttpCode(HttpStatus.OK)
  @ApiGetAccessToken()
  async getAccessToken(
    @AuthorizationToken('authorization', BearerTokenPipe)
    refreshToken: string,
  ): Promise<HttpResponseOutbound> {
    return new HttpOKResponse(
      'Aqui está seu token de acesso',
      await this.getAccessTokenUseCase.execute(refreshToken),
    );
  }
}
