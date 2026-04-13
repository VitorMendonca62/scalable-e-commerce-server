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
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
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
import { ApiGetGoogleUrl } from './decorators/docs/api-get-google-url.decorator';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import RevocationGuard from './guards/revocation.guard';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '@config/environment/env.validation';
import { FastifyReply, FastifyRequest } from 'fastify';
import {
  CreateSessionUseCase,
  FinishSessionUseCase,
  GetAccessTokenUseCase,
} from '@auth/application/use-cases/use-cases';
import { LoginUserDTO } from './dtos/dtos';
import QueueService from '../../secondary/message-broker/queue.service';
import { UserGoogleInCallBack } from '@auth/domain/types/user-google';
import UseCaseResultToHttpMapper from '@auth/infrastructure/mappers/use-case-result-to-http.mapper';

@Controller('auth')
@ApiTags('AuthController')
export class AuthController {
  constructor(
    private readonly useCaseResultToHttpMapper: UseCaseResultToHttpMapper,
    private readonly userMapper: UserMapper,
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getAccessTokenUseCase: GetAccessTokenUseCase,
    private readonly finishSessionUseCase: FinishSessionUseCase,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly queueService: QueueService,
  ) {}

  @Get('google')
  @HttpCode(HttpStatus.OK)
  @ApiGetGoogleUrl()
  getGoogleURL() {
    const redirectUri = this.configService.get('GOOGLE_CALLBACK_URL');
    const clientID = this.configService.get('GOOGLE_CLIENT_ID');

    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${redirectUri}&scope=email%20profile&client_id=${clientID}`;
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiExcludeEndpoint()
  async googleAuth(
    @Req() request: FastifyRequest & { user: UserGoogleInCallBack },
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    const user = request.user;
    const googleLoginDTO = this.userMapper.googleLoginDTOForEntity(
      user,
      ip,
      userAgent,
    );

    const useCaseResult =
      await this.createSessionUseCase.executeWithGoogle(googleLoginDTO);

    if (useCaseResult.ok === true) {
      const { newUser } = useCaseResult.result;

      if (newUser !== undefined) {
        void this.queueService.sendUserCreatedWithGoogle({
          userID: newUser.userID,
          name: user.name,
          username: user.username,
          email: user.email,
          roles: newUser.roles,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        });
      }
    }

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpCreatedResponse('Usuário realizou login com sucesso', {
        [Cookies.RefreshToken]: useCaseResult.ok
          ? useCaseResult.result.tokens.refreshToken
          : null,
        [Cookies.AccessToken]: useCaseResult.ok
          ? useCaseResult.result.tokens.accessToken
          : null,
      }),
      response,
    );
  }

  @Post('/login')
  @ApiLoginUser()
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.createSessionUseCase.execute(
      this.userMapper.loginDTOForEntity(dto, ip, userAgent),
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpCreatedResponse('Usuário realizou login com sucesso', {
        [Cookies.RefreshToken]: useCaseResult.ok
          ? useCaseResult.result.refreshToken
          : null,
        [Cookies.AccessToken]: useCaseResult.ok
          ? useCaseResult.result.accessToken
          : null,
      }),
      response,
    );
  }

  @Get('/token')
  @UseGuards(RevocationGuard)
  @ApiGetAccessToken()
  async getAccessToken(
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-id') userID: string,
    @Headers('x-token-id') tokenID: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.getAccessTokenUseCase.execute(
      userID,
      tokenID,
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse('Seu token de acesso foi renovado', {
        [Cookies.AccessToken]: useCaseResult.ok ? useCaseResult.result : null,
      }),
      response,
    );
  }

  @Post('/logout')
  @UseGuards(RevocationGuard)
  @ApiLogout()
  async logout(
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-id') userID: string,
    @Headers('x-token-id') tokenID: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.finishSessionUseCase.execute(
      tokenID,
      userID,
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpNoContentResponse(),
      response,
    );
  }
}
