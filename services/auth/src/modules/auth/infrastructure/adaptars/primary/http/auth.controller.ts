import {
  Controller,
  Post,
  HttpStatus,
  Body,
  Get,
  Res,
  Ip,
  Headers,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiGetAccessToken } from './decorators/docs/api-get-access-token-user.decorator';
import { ApiLoginUser } from './decorators/docs/api-login-user.decorator';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';
import {
  HttpResponseOutbound,
  HttpCreatedResponse,
  HttpOKResponse,
  HttpNoContentResponse,
} from '@auth/domain/ports/primary/http/sucess.port';
import { ApiLogout } from './decorators/docs/api-logout.decorator';
import CookieService from '@auth/infrastructure/adaptars/secondary/cookie-service/cookie.service';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';
import RevocationGuard from './guards/revocation.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { UsersQueueService } from '../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateSessionUseCase,
  FinishSessionUseCase,
  GetAccessTokenUseCase,
} from '@auth/application/use-cases/use-cases';
import { LoginUserDTO } from './dtos/dtos';

@Controller('auth')
@ApiTags('AuthController')
export class AuthController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
    private readonly finishSessionUseCase: FinishSessionUseCase,
    private readonly cookieService: CookieService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly usersQueueService: UsersQueueService,
  ) {}

  @Get('google')
  @HttpCode(HttpStatus.OK)
  getGoogleURL() {
    const redirectUri = this.configService.get('GOOGLE_CALLBACK_URL');
    const clientID = this.configService.get('GOOGLE_CLIENT_ID');

    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${redirectUri}&scope=email%20profile&client_id=${clientID}`;
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async googleAuthRedirect(
    @Req() request: FastifyRequest & { user: UserGoogleInCallBack },
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
  ) {
    const user = request.user;
    const googleLoginDTO = this.userMapper.googleLoginDTOForEntity(user, ip);

    const { newUser, result } =
      await this.createSessionUseCase.executeWithGoogle(googleLoginDTO);

    if (newUser != undefined) {
      this.usersQueueService.send('user-create-google', {
        userID: newUser.userID,
        name: user.name,
        username: user.username,
        email: newUser.email,
        roles: newUser.roles,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      });
    }

    const { accessToken, refreshToken } = result;

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

  @Post('/login')
  @ApiLoginUser()
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: FastifyReply,
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

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Usuário realizou login com sucesso');
  }

  @Get('/token')
  @UseGuards(RevocationGuard)
  @ApiGetAccessToken()
  async getAccessToken(
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-id') userID: string,
    @Headers('x-token-id') tokenID: string,
  ): Promise<HttpResponseOutbound> {
    const token = await this.getAccessTokenUseCase.execute(userID, tokenID);
    this.cookieService.setCookie(
      Cookies.AccessToken,
      token,
      TokenExpirationConstants.ACCESS_TOKEN_MS,
      response,
    );

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Seu token de acesso foi renovado');
  }

  @Post('/logout')
  @UseGuards(RevocationGuard)
  @ApiLogout()
  async logout(
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-id') userID: string,
    @Headers('x-token-id') tokenID: string,
  ): Promise<HttpResponseOutbound> {
    await this.finishSessionUseCase.execute(tokenID, userID);
    response.clearCookie(Cookies.RefreshToken, { signed: true });
    response.clearCookie(Cookies.AccessToken, { signed: true });

    response.status(HttpStatus.NO_CONTENT);
    return new HttpNoContentResponse();
  }
}
