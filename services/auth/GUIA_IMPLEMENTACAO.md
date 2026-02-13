# 📘 Guia de Implementação - Correções Prioritárias

## Índice
1. [Setup Inicial](#setup-inicial)
2. [P-01: Rate Limiting - Passo a Passo](#p-01-rate-limiting)
3. [P-02: Auditoria - Implementação Completa](#p-02-auditoria)
4. [P-03: Timing Attack Fix](#p-03-timing-attack)
5. [P-04: CORS Configuration](#p-04-cors)
6. [Scripts de Teste](#scripts-de-teste)

---

## Setup Inicial

### Instalar Dependências Necessárias

```bash
# Rate Limiting
npm install @nestjs/throttler

# Logging avançado
npm install nest-winston winston

# JWT validation
npm install jsonwebtoken

# Database auditoria
npm install @nestjs/mongoose mongoose-audit
```

---

## P-01: Rate Limiting

### Arquivo: `src/modules/auth/auth.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { CreateSessionUseCase } from './application/use-cases/create-session.usecase';
import { GetAccessTokenUseCase } from './application/use-cases/get-access-token.usecase';
import { UserRepository } from './domain/ports/secondary/user-repository.port';
import { AuthController } from './infrastructure/adaptars/primary/http/auth.controller';
import { JwtTokenService } from './infrastructure/adaptars/secondary/token-service/jwt-token.service';
import { UserMapper } from './infrastructure/mappers/user.mapper';
import { EnvironmentVariables } from 'src/config/environment/env.validation';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseUserRepository } from './infrastructure/adaptars/secondary/database/repositories/mongoose-user.repository';
import { UsersQueueService } from './infrastructure/adaptars/secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { TokenService } from './domain/ports/secondary/token-service.port';
import { JwtModule } from '@nestjs/jwt';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import BcryptPasswordHasher from './infrastructure/adaptars/secondary/password-hasher/bcrypt-password-hasher';
import { PasswordController } from './infrastructure/adaptars/primary/http/password.controller';
import { EmailSender } from './domain/ports/secondary/mail-sender.port';
import NodemailerEmailSender from './infrastructure/adaptars/secondary/email-sender/nodemailer.service';
import { EmailCodeModel, EmailCodeSchema } from './infrastructure/adaptars/secondary/database/models/email-code.model';
import EmailCodeRepository from './domain/ports/secondary/email-code-repository.port';
import MongooseEmailCodeRepository from './infrastructure/adaptars/secondary/database/repositories/mongoose-email-code.repository';
import { ChangePasswordUseCase } from './application/use-cases/change-password.usecase';
import { TokenRepository } from './domain/ports/secondary/token-repository.port';
import { RedisTokenRepository } from './infrastructure/adaptars/secondary/database/repositories/redis-token.repository';
import { FinishSessionUseCase } from './application/use-cases/finish-session.usecase';
import CookieService from './infrastructure/adaptars/secondary/cookie-service/cookie.service';
import * as fs from 'fs';
import * as path from 'path';
import CertsController from './infrastructure/adaptars/primary/http/certs.controller';
import GetCertsUseCase from './application/use-cases/get-certs.usecase';
import { GoogleStrategy } from './infrastructure/adaptars/primary/http/strategies/google.strategy';
import ForgotPasswordUseCase from './application/use-cases/forgot-password.usecase';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

// ✅ NOVO: Importar UserModel e UserSchema
import {
  UserModel,
  UserSchema,
} from './infrastructure/adaptars/secondary/database/models/user.model';

@Module({
  imports: [
    // ✅ NOVO: Configurar Rate Limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,    // 1 minuto
        limit: 5,      // 5 requisições
      },
      {
        name: 'medium',
        ttl: 300000,   // 5 minutos
        limit: 15,     // 15 requisições
      },
      {
        name: 'long',
        ttl: 900000,   // 15 minutos
        limit: 50,     // 50 requisições
      },
    ]),
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserSchema },
      { name: EmailCodeModel.name, schema: EmailCodeSchema },
    ]),
    JwtModule.register({
      privateKey: fs.readFileSync(
        path.join(process.cwd(), `certs/auth-private.pem`),
      ),
      publicKey: fs.readFileSync(
        path.join(process.cwd(), `certs/auth-public.pem`),
      ),
      signOptions: { algorithm: 'RS256' },
    }),
    ClientsModule.registerAsync([
      {
        name: 'USERS_BROKER_SERVICE',
        useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBITMQ_DEFAULT_USER')}:${configService.get('RABBITMQ_DEFAULT_PASS')}@${configService.get('RABBITMQ_HOST')}`,
            ],
            queue: 'users_queue',
            queueOptions: {
              exclusive: false,
              autoDelete: false,
              durable: true,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthController, PasswordController, CertsController],
  providers: [
    // ✅ NOVO: Registrar ThrottlerGuard globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    CreateSessionUseCase,
    GetAccessTokenUseCase,
    UserRepository,
    MongooseUserRepository,
    JwtTokenService,
    UserMapper,
    PasswordHasher,
    BcryptPasswordHasher,
    UsersQueueService,
    TokenService,
    PasswordController,
    EmailSender,
    NodemailerEmailSender,
    EmailCodeRepository,
    MongooseEmailCodeRepository,
    ChangePasswordUseCase,
    TokenRepository,
    RedisTokenRepository,
    FinishSessionUseCase,
    CookieService,
    CertsController,
    GetCertsUseCase,
    GoogleStrategy,
    ForgotPasswordUseCase,
  ],
})
export class AuthModule {}
```

### Arquivo: `src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts`

```typescript
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
import { Throttle } from '@nestjs/throttler';
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
import { WrongCredentials } from '@auth/domain/ports/primary/http/errors.port';

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
  @Throttle('medium', '10-5m') // ✅ Rate limit para Google OAuth
  getGoogleURL() {
    const redirectUri = this.configService.get('GOOGLE_CALLBACK_URL');
    const clientID = this.configService.get('GOOGLE_CLIENT_ID');

    return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&redirect_uri=${redirectUri}&scope=email%20profile&client_id=${clientID}`;
  }

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Throttle('short', '5-1m') // ✅ Rate limit para callback
  async googleAuthRedirect(
    @Req() request: FastifyRequest & { user: UserGoogleInCallBack },
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
  ) {
    const user = request.user;
    const googleLoginDTO = this.userMapper.googleLoginDTOForEntity(user, ip);

    const useCaseResult =
      await this.createSessionUseCase.executeWithGoogle(googleLoginDTO);

    const { newUser, tokens } = useCaseResult.result;

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

    const { accessToken, refreshToken } = tokens;

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
  @Throttle('short', '5-1m') // ✅ 5 requisições por minuto
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.createSessionUseCase.execute(
      this.userMapper.loginDTOForEntity(dto, ip),
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.UNAUTHORIZED);
      return new WrongCredentials(useCaseResult.message);
    }

    const { accessToken, refreshToken } = useCaseResult.result;

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
  @Throttle('medium', '20-5m') // ✅ 20 requisições por 5 minutos (refresh token)
  async getAccessToken(
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-id') userID: string,
    @Headers('x-token-id') tokenID: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.getAccessTokenUseCase.execute(
      userID,
      tokenID,
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.UNAUTHORIZED);
      return new WrongCredentials(useCaseResult.message);
    }

    this.cookieService.setCookie(
      Cookies.AccessToken,
      useCaseResult.result,
      TokenExpirationConstants.ACCESS_TOKEN_MS,
      response,
    );

    response.status(HttpStatus.OK);
    return new HttpOKResponse('Seu token de acesso foi renovado');
  }

  @Post('/logout')
  @UseGuards(RevocationGuard)
  @ApiLogout()
  @Throttle('medium', '30-5m') // ✅ 30 requisições por 5 minutos (logout)
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
```

### Arquivo: `src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts`

```typescript
import {
  Controller,
  Post,
  HttpStatus,
  Body,
  Res,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.usecase';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import {
  HttpResponseOutbound,
  HttpOKResponse,
} from '@auth/domain/ports/primary/http/sucess.port';
import { ApiUpdatePassword } from './decorators/docs/api-update-password.decorator';
import { ApiValidateCodeForForgotPassword } from './decorators/docs/api-validate-code-for-forgot-password.decorator';
import { ApiSendCodeForForgotPassword } from './decorators/docs/api-send-code-for-forgot-password.decorator';
import { SendCodeForForgotPasswordDTO } from './dtos/send-code-for-forgot-pass.dto';
import { ValidateCodeForForgotPasswordDTO } from './dtos/validate-code-for-forgot-pass.dto';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import { ApiResetPassword } from './decorators/docs/api-reset-password.decorator';
import CookieService from '../../secondary/cookie-service/cookie.service';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';
import { FastifyReply } from 'fastify';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import {
  FieldInvalid,
  NotFoundUser,
  WrongCredentials,
} from '@auth/domain/ports/primary/http/errors.port';
import ForgotPasswordUseCase from '@auth/application/use-cases/forgot-password.usecase';

@Controller('/pass')
@ApiTags('PasswordController')
export class PasswordController {
  constructor(
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly cookieService: CookieService,
  ) {}

  @Post('/update')
  @ApiUpdatePassword()
  @Throttle('long', '5-15m') // ✅ 5 mudanças de senha por 15 minutos
  async updatePassword(
    @Body() dto: UpdatePasswordDTO,
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-email') email: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.changePasswordUseCase.executeUpdate(
      email,
      dto.oldPassword,
      dto.newPassword,
    );

    if (useCaseResult.ok === false) {
      if (
        useCaseResult.reason ===
        ApplicationResultReasons.WRONG_CREDENTIALS
      ) {
        response.status(HttpStatus.UNAUTHORIZED);
        return new WrongCredentials(useCaseResult.message);
      }

      if (useCaseResult.reason === ApplicationResultReasons.NOT_FOUND) {
        response.status(HttpStatus.NOT_FOUND);
        return new NotFoundUser(useCaseResult.message);
      }

      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid(useCaseResult.message, 'password');
    }

    return new HttpOKResponse(
      'Sua senha foi alterada com sucesso.',
    );
  }

  @Post('/send-code')
  @ApiSendCodeForForgotPassword()
  @Throttle('long', '3-15m') // ✅ 3 códigos por 15 minutos
  async sendCode(
    @Body() dto: SendCodeForForgotPasswordDTO,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult =
      await this.forgotPasswordUseCase.sendCode(dto.email);

    if (useCaseResult.ok === false) {
      return new NotFoundUser(useCaseResult.message);
    }

    return new HttpOKResponse(
      'Código de recuperação enviado para seu email.',
    );
  }

  @Post('/validate-code')
  @ApiValidateCodeForForgotPassword()
  @Throttle('medium', '10-5m') // ✅ 10 tentativas por 5 minutos
  async validateCode(
    @Body() dto: ValidateCodeForForgotPasswordDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.forgotPasswordUseCase.validateCode(
      dto.code,
      dto.email,
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid(useCaseResult.message, 'code');
    }

    this.cookieService.setCookie(
      Cookies.ResetPassToken,
      useCaseResult.result,
      TokenExpirationConstants.RESET_PASS_TOKEN_MS,
      response,
    );
    return new HttpOKResponse(
      'Seu código de recuperação de senha foi validado com sucesso.',
    );
  }

  @Post('/reset')
  @ApiResetPassword()
  @Throttle('medium', '10-5m') // ✅ 10 tentativas por 5 minutos
  async resetPassword(
    @Body() dto: ResetPasswordDTO,
    @Res() response: FastifyReply,
    @Headers('x-user-email') email: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.changePasswordUseCase.executeReset(
      email,
      dto.newPassword,
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.UNAUTHORIZED);
      return new WrongCredentials(useCaseResult.message);
    }

    response
      .status(HttpStatus.SEE_OTHER)
      .redirect('https://github.com/VitorMendonca62'); // Login
  }
}
```

---

## P-02: Auditoria

### Arquivo: `src/common/audit/audit.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { WinstonLogger } from 'nest-winston';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

export enum AuditEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST',
  FORGOT_PASSWORD_VALIDATED = 'FORGOT_PASSWORD_VALIDATED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
}

export interface AuditLog {
  eventType: AuditEventType;
  userID?: string;
  email?: string;
  ip: string;
  userAgent?: string;
  timestamp: Date;
  reason?: string;
  statusCode?: number;
  details?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel('AuditLog') private readonly auditModel: Model<AuditLog>,
  ) {}

  async log(audit: AuditLog): Promise<void> {
    try {
      // ✅ Não logar dados sensíveis
      const safeLog = this.sanitizeLog(audit);

      this.logger.log('Auth Audit Event', JSON.stringify(safeLog));

      // ✅ Salvar em MongoDB
      await this.auditModel.create(safeLog);
    } catch (error) {
      // ✅ Logar erro sem interromper fluxo
      this.logger.error('Failed to log audit event', error);
    }
  }

  private sanitizeLog(audit: AuditLog): AuditLog {
    return {
      ...audit,
      email: audit.email ? this.maskEmail(audit.email) : undefined,
      details: this.sanitizeDetails(audit.details),
    };
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const masked =
      localPart.substring(0, 2) + '***@' + domain.substring(0, 3) + '***';
    return masked;
  }

  private sanitizeDetails(details?: Record<string, any>) {
    if (!details) return undefined;
    const { password, token, refreshToken, ...safe } = details;
    return safe;
  }

  async getAuditLogs(
    userID: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return await this.auditModel
      .find({ userID })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getFailedLoginAttempts(
    email: string,
    minutesAgo: number = 15,
  ): Promise<number> {
    const since = new Date(Date.now() - minutesAgo * 60000);

    return await this.auditModel.countDocuments({
      email: this.maskEmail(email),
      eventType: AuditEventType.LOGIN_FAILURE,
      timestamp: { $gte: since },
    });
  }
}
```

### Arquivo: `src/common/audit/audit.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditService } from './audit.service';
import * as mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    eventType: { type: String, required: true, index: true },
    userID: { type: String, index: true },
    email: { type: String },
    ip: { type: String, required: true },
    userAgent: { type: String },
    timestamp: { type: Date, required: true, default: Date.now, index: true },
    reason: { type: String },
    statusCode: { type: Number },
    details: { type: mongoose.Schema.Types.Mixed },
  },
  {
    collection: 'audit_logs',
    timestamps: true,
  },
);

// ✅ Criar índice composto para queries eficientes
auditLogSchema.index({ userID: 1, timestamp: -1 });
auditLogSchema.index({ email: 1, timestamp: -1 });
auditLogSchema.index({ eventType: 1, timestamp: -1 });

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'AuditLog', schema: auditLogSchema },
    ]),
  ],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
```

### Integração no `CreateSessionUseCase`:

```typescript
import { AuditService, AuditEventType } from '@common/audit/audit.service';

@Injectable()
export class CreateSessionUseCase implements CreateSesssionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
    private readonly auditService: AuditService,  // ✅ NOVO
  ) {}

  async execute(inputUser: UserLogin): Promise<ExecuteReturn> {
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    if (userJSON === undefined || userJSON === null) {
      // ✅ Log de falha
      await this.auditService.log({
        eventType: AuditEventType.LOGIN_FAILURE,
        email: inputUser.email.getValue(),
        ip: inputUser.ip,
        reason: 'User not found',
        timestamp: new Date(),
      });

      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      };
    }

    const user = this.userMapper.modelToEntity(userJSON);
    
    // ✅ Timing-safe password comparison
    const passwordToCompare = userJSON?.password ?? this.getDummyHash();
    const isPasswordValid = this.passwordHasher.compare(
      inputUser.password.getValue(),
      passwordToCompare,
    );

    if (!isPasswordValid) {
      await this.auditService.log({
        eventType: AuditEventType.LOGIN_FAILURE,
        email: inputUser.email.getValue(),
        ip: inputUser.ip,
        reason: 'Invalid credentials',
        timestamp: new Date(),
      });

      return {
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      };
    }

    // ✅ Verificar tentativas de login falhadas recentes
    const failedAttempts = await this.auditService.getFailedLoginAttempts(
      inputUser.email.getValue(),
      15,
    );

    if (failedAttempts > 10) {
      // Account lockout após 10 tentativas em 15 minutos
      await this.auditService.log({
        eventType: AuditEventType.ACCOUNT_LOCKED,
        email: inputUser.email.getValue(),
        ip: inputUser.ip,
        reason: `Too many failed attempts (${failedAttempts})`,
        timestamp: new Date(),
      });

      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Conta temporariamente bloqueada. Tente novamente em 15 minutos.',
      };
    }

    const tokens = await this.generateAccessAndRefreshToken(
      userJSON,
      inputUser.ip,
    );

    // ✅ Log de sucesso
    await this.auditService.log({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userID: userJSON.userID,
      email: userJSON.email,
      ip: inputUser.ip,
      timestamp: new Date(),
    });

    return {
      ok: true,
      result: tokens,
    };
  }

  private getDummyHash(): string {
    return '$2a$10$dummyhashforconstanttiming1234567890123456789';
  }

  // ... resto do código
}
```

---

## P-03: Timing Attack Fix

### Arquivo: `src/modules/auth/application/use-cases/create-session.usecase.ts` (Atualizado)

```typescript
import { AccountsProvider } from '@auth/domain/types/accounts-provider';
import { Injectable } from '@nestjs/common';
import { TokenService } from '@auth/domain/ports/secondary/token-service.port';
import { UserMapper } from '@auth/infrastructure/mappers/user.mapper';
import { UserLogin } from '../../domain/entities/user-login.entity';
import { UserRepository } from '@auth/domain/ports/secondary/user-repository.port';
import PasswordHashedVO from '@auth/domain/values-objects/password-hashed/password-hashed-vo';
import { TokenRepository } from '@auth/domain/ports/secondary/token-repository.port';
import { UserGoogleLogin } from '@auth/domain/entities/user-google-login.entity';
import { UserModel } from '@auth/infrastructure/adaptars/secondary/database/models/user.model';
import { v7 } from 'uuid';
import {
  CreateSesssionPort,
  ExecuteReturn,
  ExecuteWithGoogleReturn,
} from '@auth/domain/ports/application/create-session.port';
import { ApplicationResultReasons } from '@auth/domain/enums/application-result-reasons';
import { PasswordHasher } from '@auth/domain/ports/secondary/password-hasher.port';
import { AuditService, AuditEventType } from '@common/audit/audit.service';

@Injectable()
export class CreateSessionUseCase implements CreateSesssionPort {
  private readonly DUMMY_HASH =
    '$2a$10$dummyhashforconstanttiming1234567890123456789';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
    private readonly passwordHasher: PasswordHasher,
    private readonly auditService: AuditService,
  ) {}

  async execute(inputUser: UserLogin): Promise<ExecuteReturn> {
    // ✅ SEMPRE fazer lookup e comparação
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    // ✅ Usar hash fictício para manter tempo consistente se usuário não existe
    const passwordToCompare = userJSON?.password ?? this.DUMMY_HASH;

    // ✅ Comparação única com timing constante
    const isPasswordValid = this.passwordHasher.compare(
      inputUser.password.getValue(),
      passwordToCompare,
    );

    // ✅ Mesma resposta para ambos os casos
    if (userJSON === undefined || !isPasswordValid) {
      await this.auditService.log({
        eventType: AuditEventType.LOGIN_FAILURE,
        email: inputUser.email.getValue(),
        ip: inputUser.ip,
        reason: userJSON ? 'Invalid password' : 'User not found',
        timestamp: new Date(),
      });

      return {
        ok: false,
        reason: ApplicationResultReasons.WRONG_CREDENTIALS,
        message: 'Suas credenciais estão incorretas. Tente novamente',
      };
    }

    // ✅ Verificar tentativas de login falhadas
    const failedAttempts = await this.auditService.getFailedLoginAttempts(
      inputUser.email.getValue(),
      15,
    );

    if (failedAttempts > 10) {
      await this.auditService.log({
        eventType: AuditEventType.ACCOUNT_LOCKED,
        email: inputUser.email.getValue(),
        ip: inputUser.ip,
        reason: `Too many failed attempts (${failedAttempts})`,
        timestamp: new Date(),
      });

      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_POSSIBLE,
        message: 'Conta temporariamente bloqueada. Tente novamente mais tarde.',
      };
    }

    const tokens = await this.generateAccessAndRefreshToken(
      userJSON,
      inputUser.ip,
    );

    await this.auditService.log({
      eventType: AuditEventType.LOGIN_SUCCESS,
      userID: userJSON.userID,
      email: userJSON.email,
      ip: inputUser.ip,
      timestamp: new Date(),
    });

    return {
      ok: true,
      result: tokens,
    };
  }

  async executeWithGoogle(
    inputUser: UserGoogleLogin,
  ): Promise<ExecuteWithGoogleReturn> {
    const userModel = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    let newUserModel: UserModel;
    if (userModel === null || userModel === undefined) {
      const newUser = this.userMapper.googleEntityForModel(inputUser, v7());
      newUserModel = await this.userRepository.create(newUser);

      await this.auditService.log({
        eventType: AuditEventType.LOGIN_SUCCESS,
        userID: newUserModel.userID,
        email: newUserModel.email,
        ip: inputUser.ip,
        reason: 'New user created via Google OAuth',
        timestamp: new Date(),
      });
    } else if (userModel.accountProvider === AccountsProvider.DEFAULT) {
      await this.userRepository.update(userModel.userID, {
        accountProvider: AccountsProvider.GOOGLE,
        accountProviderID: inputUser.id,
      });

      await this.auditService.log({
        eventType: AuditEventType.LOGIN_SUCCESS,
        userID: userModel.userID,
        email: userModel.email,
        ip: inputUser.ip,
        reason: 'Existing user linked with Google OAuth',
        timestamp: new Date(),
      });
    }

    return {
      ok: true,
      result: {
        tokens: await this.generateAccessAndRefreshToken(
          newUserModel || userModel,
          inputUser.ip,
        ),
        newUser: newUserModel,
      },
    };
  }

  private async generateAccessAndRefreshToken(user: UserModel, ip: string) {
    const accessToken = this.tokenService.generateAccessToken({
      email: user.email,
      userID: user.userID,
      roles: user.roles,
    });

    const { refreshToken, tokenID } = this.tokenService.generateRefreshToken(
      user.userID,
    );

    await this.tokenRepository.saveSession(tokenID, user.userID, ip);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
}
```

---

## P-04: CORS Configuration

### Arquivo: `src/config/app.config.ts` (Atualizado)

```typescript
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables, NodeEnv } from './environment/env.validation';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { FieldInvalid } from '@auth/domain/ports/primary/http/errors.port';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from '@nestjs/common';

export default class AppConfig {
  private readonly logger = new Logger(AppConfig.name);

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly app: NestFastifyApplication,
  ) {}

  configSwagger() {
    if (this.configService.get('NODE_ENV') === NodeEnv.Production) return;

    const documentBuilder = new DocumentBuilder()
      .setTitle('Auth System')
      .setDescription('The Authentication system for an e-commerce store')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(this.app, documentBuilder);

    SwaggerModule.setup('docs', this.app, document, {
      swaggerOptions: {
        requestInterceptor: (req) => {
          req.credentials = 'include';
          return req;
        },
      },
    });
  }

  // ✅ NOVO: Configuração CORS melhorada
  configCors() {
    const nodeEnv = this.configService.get<NodeEnv>('NODE_ENV');
    const allowedOriginsString = this.configService.get<string>(
      'ALLOWED_ORIGINS',
    );

    if (nodeEnv === NodeEnv.Production) {
      if (!allowedOriginsString) {
        this.logger.warn(
          'ALLOWED_ORIGINS not set for production. CORS disabled for security.',
        );
        return;
      }

      const allowedOrigins = allowedOriginsString
        .split(',')
        .map(origin => origin.trim())
        .filter(origin => origin.length > 0);

      if (allowedOrigins.length === 0) {
        this.logger.warn('No valid origins found in ALLOWED_ORIGINS');
        return;
      }

      this.logger.log(`CORS enabled for origins: ${allowedOrigins.join(', ')}`);

      this.app.enableCors({
        origin: (origin, callback) => {
          // ✅ Validar cada origem
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            this.logger.warn(`CORS rejected origin: ${origin}`);
            callback(new Error('Not allowed by CORS'), false);
          }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
        allowedHeaders: [
          'Content-Type',
          'Authorization',
          'X-Request-ID',
          'X-User-ID',
          'X-Token-ID',
        ],
        exposedHeaders: [
          'Set-Cookie',
          'X-Request-ID',
          'X-RateLimit-Limit',
          'X-RateLimit-Remaining',
          'X-RateLimit-Reset',
        ],
        maxAge: 86400, // 24 horas
        preflightContinue: false,
      });
    } else {
      // ✅ Development/Test: mais permissivo
      this.app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS', 'PUT'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        exposedHeaders: ['Set-Cookie', 'X-Request-ID'],
      });

      this.logger.log('CORS enabled for all origins (dev/test mode)');
    }
  }

  configValidationPipe() {
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        transform: false,
        exceptionFactory: (errors) => {
          if (errors.length === 0) {
            return new FieldInvalid('Unknown error', 'Error');
          }

          const firstError = errors[0];
          const firstConstraintMessage = firstError.constraints
            ? Object.values(firstError.constraints)[0]
            : 'Unknown error';

          return new FieldInvalid(firstConstraintMessage, firstError.property);
        },
      }),
    );
  }
}
```

### Arquivo `.env.production` (Adicionar):

```bash
# Origens permitidas para CORS (separadas por vírgula)
ALLOWED_ORIGINS=https://frontend.example.com,https://app.example.com,https://www.example.com
```

---

## Scripts de Teste

### Arquivo `test/auth.rate-limit.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rate Limiting (E2E)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should allow 5 requests per minute', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'ValidPassword123!',
      };

      // ✅ Fazer 5 requisições (devem passar)
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/auth/login')
          .send(loginData);

        // Pode ser 401 (credenciais inválidas) ou 201 (sucesso)
        expect([HttpStatus.CREATED, HttpStatus.UNAUTHORIZED]).toContain(
          response.status,
        );
      }

      // ✅ 6ª requisição deve ser rate limitada
      const rateLimitedResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginData);

      expect(rateLimitedResponse.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });

  describe('POST /pass/send-code', () => {
    it('should limit to 3 requests per 15 minutes', async () => {
      const sendCodeData = {
        email: 'test@example.com',
      };

      // ✅ Fazer 3 requisições (devem passar)
      for (let i = 0; i < 3; i++) {
        const response = await request(app.getHttpServer())
          .post('/pass/send-code')
          .send(sendCodeData);

        expect([HttpStatus.OK, HttpStatus.NOT_FOUND]).toContain(
          response.status,
        );
      }

      // ✅ 4ª requisição deve ser rate limitada
      const rateLimitedResponse = await request(app.getHttpServer())
        .post('/pass/send-code')
        .send(sendCodeData);

      expect(rateLimitedResponse.status).toBe(HttpStatus.TOO_MANY_REQUESTS);
    });
  });
});
```

---

## Checklist de Implementação

- [ ] **P-01 - Rate Limiting**
  - [ ] Instalar `@nestjs/throttler`
  - [ ] Configurar ThrottlerModule em `auth.module.ts`
  - [ ] Adicionar `@Throttle()` decoradores em controllers
  - [ ] Testar com script E2E
  - [ ] Validar em production

- [ ] **P-02 - Auditoria**
  - [ ] Criar `AuditService` e `AuditModule`
  - [ ] Criar schema MongoDB para audit logs
  - [ ] Integrar AuditService em use cases
  - [ ] Adicionar índices para performance
  - [ ] Testar logs de sucesso/falha

- [ ] **P-03 - Timing Attack**
  - [ ] Usar dummy hash em comparações
  - [ ] Validar comportamento de timing
  - [ ] Testar com ferramentas de profiling

- [ ] **P-04 - CORS**
  - [ ] Configurar whitelist de origens
  - [ ] Adicionar variável de ambiente `ALLOWED_ORIGINS`
  - [ ] Testar em dev e production
  - [ ] Validar headers CORS

---

**Próximas etapas:** Implement remaining items (P-05 a P-14)

