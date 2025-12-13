// Decorators
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetAccessToken } from './decorators/docs/api-get-access-token-user.decorator';
import { ApiLoginUser } from './decorators/docs/api-login-user.decorator';
import { AuthorizationToken } from './decorators/get-value/authorization-token.decorator';

// Guards
import { AuthGuard } from './guards/auth.guard';

// Pipes
import { IdInTokenPipe } from '@common/pipes/id-in-token.pipe';

// DTO's
import { LoginUserDTO } from './dtos/login-user.dto';

// Mappers
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';

// Use Cases
import { CreateSessionUseCase } from '@auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@auth/application/use-cases/get-access-token';

// Ports
import {
  HttpResponseOutbound,
  HttpCreatedResponse,
  HttpOKResponse,
} from '@auth/domain/ports/primary/http/sucess.port';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
  ) {}

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
  @UseGuards(AuthGuard)
  @ApiGetAccessToken()
  async getAccessToken(
    @AuthorizationToken('authorization', IdInTokenPipe)
    userID: string,
  ): Promise<HttpResponseOutbound> {
    return new HttpOKResponse(
      'Aqui está seu token de acesso',
      await this.getAccessTokenUseCase.execute(userID),
    );
  }
}
