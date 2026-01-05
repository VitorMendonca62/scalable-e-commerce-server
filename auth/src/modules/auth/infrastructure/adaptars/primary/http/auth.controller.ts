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
import { ApiLogout } from './decorators/docs/api-logout.decorator';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { UserInRefreshToken } from '@auth/domain/types/user';
import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';

@Controller('auth')
@ApiTags('AuthController')
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
    private readonly finishSessionUseCase: FinishSessionUseCase,
    private readonly cookieService: CookieService,
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  @ApiLoginUser()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: Response,
    @Ip() ip: string,
  ): Promise<HttpResponseOutbound> {
    const token = await this.createSessionUseCase.execute(
      this.userMapper.loginDTOForEntity(dto, ip),
    );
    const { accessToken, refreshToken } = token;

    this.cookieService.setCookie(
      Cookies.RefreshToken,
      refreshToken,
      TokenExpirationConstants.REFRESH_TOKEN_MS,
      response,
    );
    this.cookieService.setCookie(
      Cookies.AccessToken,
      accessToken,
      TokenExpirationConstants.ACCESS_TOKEN_MS,
      response,
    );

    return new HttpCreatedResponse('Usuário realizou login com sucesso');
  }

  @Get('/token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTRefreshGuard)
  @ApiGetAccessToken()
  @SkipThrottle()
  async getAccessToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<HttpResponseOutbound> {
    const { userID, tokenID } = request.user as UserInRefreshToken;

    const token = await this.getAccessTokenUseCase.execute(userID, tokenID);
    this.cookieService.setCookie(
      Cookies.AccessToken,
      token,
      TokenExpirationConstants.ACCESS_TOKEN_MS,
      response,
    );

    return new HttpOKResponse('Seu token de acesso foi renovado');
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JWTRefreshGuard)
  @ApiLogout()
  @SkipThrottle()
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<HttpResponseOutbound> {
    const { userID, tokenID } = request.user as UserInRefreshToken;

    await this.finishSessionUseCase.execute(tokenID, userID);
    response.clearCookie(Cookies.RefreshToken);
    response.clearCookie(Cookies.AccessToken);

    return new HttpNoContentResponse();
  }
}
