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
  Ip,
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
  HttpNoContentResponse,
} from '@auth/domain/ports/primary/http/sucess.port';
import { Request, Response } from 'express';
import { FinishSessionUseCase } from '@auth/application/use-cases/finish-session.usecase';

@Controller('auth')
@ApiTags('AuthController')
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
    private readonly finishSessionUseCase: FinishSessionUseCase,
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  @ApiLoginUser()
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
  ): Promise<HttpResponseOutbound> {
    const token = await this.createSessionUseCase.execute(
      this.userMapper.loginDTOForEntity(dto, ip),
    );
    const { accessToken, refreshToken } = token;
    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      maxAge: 604800000, // 7D,
      path: '/',
    });

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      maxAge: 3600000, // 1h,
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
    const { userID, tokenID } = request.user as any;

    const token = await this.getAccessTokenUseCase.execute(userID, tokenID);
    response.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
      path: '/',
    });
    return new HttpOKResponse('Seu token de acesso foi renovado');
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JWTRefreshGuard)
  // TODO Fazer docs
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<HttpResponseOutbound> {
    const { userID, tokenID } = request.user as any;

    await this.finishSessionUseCase.execute(tokenID, userID);
    response.clearCookie('refresh_token');
    response.clearCookie('access_token');

    return new HttpNoContentResponse();
  }
}
