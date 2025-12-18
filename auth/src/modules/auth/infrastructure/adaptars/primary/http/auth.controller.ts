// Decorators
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetAccessToken } from './decorators/docs/api-get-access-token-user.decorator';
import { ApiLoginUser } from './decorators/docs/api-login-user.decorator';

// Guards
import { JWTRefreshGuard } from './guards/jwt-refresh.guard';

// DTO's
import { LoginUserDTO } from './dtos/login-user.dto';

// Mappers
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';

// Use Cases
import { CreateSessionUseCase } from '@auth/application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from '@auth/application/use-cases/get-access-token.usecase';

// Ports
import {
  HttpResponseOutbound,
  HttpCreatedResponse,
  HttpOKResponse,
} from '@auth/domain/ports/primary/http/sucess.port';
import { Request, Response } from 'express';

@Controller('auth')
@ApiTags('AuthController')
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  @ApiLoginUser()
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<HttpResponseOutbound> {
    const token = await this.createSessionUseCase.execute(
      this.userMapper.loginDTOForEntity(dto),
    );
    const { accessToken, refreshToken } = token;
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      path: '/',
    });

    return new HttpCreatedResponse('Usuário realizou login com sucesso');
  }

  @Get('/token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTRefreshGuard)
  @ApiGetAccessToken()
  async getAccessToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<HttpResponseOutbound> {
    const { userID } = request.user as any;

    const token = await this.getAccessTokenUseCase.execute(userID);
    response.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      path: '/',
    });
    return new HttpOKResponse('Seu token de acesso foi renovado');
  }
}
