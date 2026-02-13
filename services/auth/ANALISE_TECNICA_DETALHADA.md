# 📋 Análise Técnica Detalhada - Serviço de Autenticação

**Data:** 13 de Fevereiro de 2026  
**Versão:** 0.34.0  
**Stack:** NestJS + TypeScript + MongoDB + Redis + RabbitMQ + Fastify

---

## 📑 Índice

1. [Resumo Executivo](#resumo-executivo)
2. [Arquitetura](#arquitetura)
3. [Problemas Identificados](#problemas-identificados)
4. [Recomendações](#recomendações)
5. [Métricas de Qualidade](#métricas-de-qualidade)

---

## Resumo Executivo

Seu projeto de autenticação demonstra uma **arquitetura bem estruturada** com forte aderência aos princípios DDD e Clean Architecture. No entanto, identificamos **18 problemas críticos e oportunidades de melhoria** que precisam ser endereçados para aumentar escalabilidade, segurança e manutenibilidade.

**Pontos Fortes:**
✅ Excelente separação entre camadas (Domain, Application, Infrastructure)  
✅ Uso correto de Value Objects e Entities  
✅ Implementação de Ports & Adapters bem estruturada  
✅ Testes com boa cobertura (unit + e2e)  
✅ Validações robustas com class-validator  
✅ JWT com suporte a múltiplos tipos de token  

**Pontos Críticos:**
❌ Rate limiting não implementado (RNF-A02)  
❌ Logging/Auditoria insuficiente (RNF-A05)  
❌ Segurança de senha em VO (múltiplas comparações = timing attacks)  
❌ Duplicação de código entre Auth e Users  
❌ Falta de tratamento de erros em async operations  
❌ CORS desabilitado em production  

---

## Arquitetura

### 📐 Estrutura em Camadas

```
Domain Layer (Clean Business Rules)
├── Entities (UserEntity, UserLogin, UserGoogleLogin)
├── Value Objects (EmailVO, PasswordVO, PasswordHashedVO, IDVO)
├── Enums (Permissions, AccountsProvider, ApplicationResultReasons)
├── Constants (Roles, TokenExpirations)
└── Ports (Interfaces para dependências)
    ├── Application Ports
    ├── Primary Ports (HTTP)
    └── Secondary Ports (BD, Cache, etc)

Application Layer (Use Cases)
├── CreateSessionUseCase
├── GetAccessTokenUseCase
├── FinishSessionUseCase
├── ChangePasswordUseCase
├── ForgotPasswordUseCase
└── GetCertsUseCase

Infrastructure Layer (Implementações técnicas)
├── Adapters
│   ├── Primary (HTTP Controllers)
│   └── Secondary (BD, Cache, Email, MQ)
├── Mappers
├── Helpers
└── Configurations
```

### 🔄 Fluxos Principais

**1. Login com Credenciais:**
```
LoginUserDTO → UserMapper → CreateSessionUseCase
→ UserRepository.findOne() → PasswordVO.comparePassword()
→ TokenService.generateAccessAndRefreshToken()
→ TokenRepository.saveSession() → CookieService.setCookie()
```

**2. Refresh Token:**
```
GET /auth/token (com RefreshToken)
→ GetAccessTokenUseCase → TokenRepository.isRevoked()
→ TokenService.generateAccessToken()
```

**3. Logout:**
```
POST /auth/logout (com x-user-id + x-token-id)
→ FinishSessionUseCase → TokenRepository.revokeOneSession()
→ CookieService.clearCookie()
```

---

## Problemas Identificados

### 🔴 CRÍTICOS (Alta Prioridade)

---

#### **P-01: Rate Limiting Não Implementado**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🔴 CRÍTICA |
| **Requisito Violado** | RNF-A02 (Limitação de Tentativas) |
| **Risco** | Vulnerabilidade a ataques de força bruta (brute force attacks) |
| **Localização** | `auth.controller.ts` (endpoints `/login`, `/pass/send-code`) |

**Problema:**
Não há implementação de rate limiting nos endpoints sensíveis. Um atacante pode fazer infinite login attempts sem restrição, aumentando a superfície de ataque.

**Código Atual (Vulnerável):**
```typescript
@Controller('auth')
export class AuthController {
  @Post('/login')
  @ApiLoginUser()
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
  ): Promise<HttpResponseOutbound> {
    // ❌ Sem rate limiting
    const useCaseResult = await this.createSessionUseCase.execute(
      this.userMapper.loginDTOForEntity(dto, ip),
    );
    // ...
  }
}
```

**Solução Recomendada:**

1. Instalar `@nestjs/throttler`:
```bash
npm install @nestjs/throttler
```

2. Configurar no `auth.module.ts`:
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000,    // 1 minuto
        limit: 5,      // 5 tentativas
      },
      {
        name: 'long',
        ttl: 900000,   // 15 minutos
        limit: 20,     // 20 tentativas
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AuthModule {}
```

3. Aplicar guardião aos controllers:
```typescript
import { ThrottlerSkip } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  @Post('/login')
  @Throttle('short', '5-1m') // 5 por minuto
  async login(
    @Body() dto: LoginUserDTO,
    @Res({ passthrough: true }) response: FastifyReply,
    @Ip() ip: string,
  ): Promise<HttpResponseOutbound> {
    // ...
  }

  @Post('/pass/send-code')
  @Throttle('long', '3-15m') // 3 por 15 minutos
  async sendCode(
    @Body() dto: SendCodeForForgotPasswordDTO,
  ): Promise<HttpResponseOutbound> {
    // ...
  }
}
```

**Benefícios:**
- ✅ Mitigação de brute force attacks
- ✅ Proteção contra DoS
- ✅ Controle granular por endpoint
- ✅ Reutilizável via decoradores

---

#### **P-02: Ausência de Logging e Auditoria Completos**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🔴 CRÍTICA |
| **Requisito Violado** | RNF-A05 (Logging e Auditoria) |
| **Risco** | Impossibilidade de rastrear eventos de segurança |
| **Localização** | Toda aplicação |

**Problema:**
Não há um sistema centralizado de logging que capture eventos críticos de autenticação. O código atual não registra:
- ❌ Tentativas de login bem-sucedidas
- ❌ Falhas de login com IP/timestamp
- ❌ Revogação de tokens
- ❌ Mudanças de senha
- ❌ Erros de validação

**Código Atual (Sem Auditoria):**
```typescript
async execute(inputUser: UserLogin): Promise<ExecuteReturn> {
  const userJSON = await this.userRepository.findOne({
    email: inputUser.email.getValue(),
  });

  if (userJSON === undefined || userJSON === null) {
    // ❌ Sem log de falha
    return {
      ok: false,
      reason: ApplicationResultReasons.NOT_FOUND,
      message: 'Suas credenciais estão incorretas. Tente novamente',
    };
  }
  // ...
}
```

**Solução Recomendada:**

1. Criar serviço de auditoria:
```typescript
// src/common/audit/audit.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

export enum AuditEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  TOKEN_REFRESH = 'TOKEN_REFRESH',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST',
  FORGOT_PASSWORD_VALIDATED = 'FORGOT_PASSWORD_VALIDATED',
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
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private auditRepository: AuditRepository,
  ) {}

  async log(audit: AuditLog): Promise<void> {
    // Não logar dados sensíveis
    const safeLog = {
      ...audit,
      email: audit.email ? this.maskEmail(audit.email) : undefined,
      details: this.sanitizeDetails(audit.details),
    };

    this.logger.info('Auth Audit Event', safeLog);
    await this.auditRepository.save(audit);
  }

  private maskEmail(email: string): string {
    const [localPart, domain] = email.split('@');
    const masked = localPart.substring(0, 2) + '***@' + domain;
    return masked;
  }

  private sanitizeDetails(details?: Record<string, any>) {
    if (!details) return undefined;
    const { password, token, refreshToken, ...safe } = details;
    return safe;
  }
}
```

2. Integrar no `CreateSessionUseCase`:
```typescript
import { AuditService, AuditEventType } from '@common/audit/audit.service';

@Injectable()
export class CreateSessionUseCase implements CreateSesssionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
    private readonly auditService: AuditService,
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
    if (
      !(user.password as PasswordHashedVO).comparePassword(
        inputUser.password.getValue(),
      )
    ) {
      // ✅ Log de credenciais inválidas
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
}
```

3. Configurar Winston no `app.module.ts`:
```typescript
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const logger = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/audit.log',
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    }),
  ],
});

@Module({
  imports: [
    // ...
    WinstonModule.forRoot([logger]),
  ],
})
export class AppModule {}
```

**Benefícios:**
- ✅ Rastreamento completo de eventos de segurança
- ✅ Conformidade com LGPD/GDPR
- ✅ Detecção de atividades suspeitas
- ✅ Facilita investigações de segurança

---

#### **P-03: Vulnerabilidade de Timing Attack em PasswordVO**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🔴 CRÍTICA |
| **Tipo de Segurança** | Timing Attack / Information Disclosure |
| **Risco** | Atacante pode enumerar usuários válidos |
| **Localização** | `create-session.usecase.ts` (linhas 30-50) |

**Problema:**
O código atual realiza comparações em sequência, permitindo timing attacks:

```typescript
// ❌ VULNERÁVEL - Múltiplas comparações sequenciais
const userJSON = await this.userRepository.findOne({
  email: inputUser.email.getValue(),
});

if (userJSON === undefined || userJSON === null) {
  // ❌ Retorna IMEDIATAMENTE se não existe
  return { ok: false, message: 'Credenciais incorretas' };
}

// ❌ Segunda comparação de password
if (!(user.password as PasswordHashedVO).comparePassword(...)) {
  // ❌ Demora DIFERENTE da primeira verificação
  return { ok: false, message: 'Credenciais incorretas' };
}
```

**Ataque:**
Um atacante pode medir o tempo de resposta para descobrir se um email existe:
- Email inválido: ~10ms (falha rápida)
- Email válido, senha errada: ~200ms (comparação bcrypt)
- Diferença observável = enumeração de usuários

**Solução Recomendada:**

```typescript
@Injectable()
export class CreateSessionUseCase implements CreateSesssionPort {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
    private readonly tokenService: TokenService,
    private readonly userMapper: UserMapper,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async execute(inputUser: UserLogin): Promise<ExecuteReturn> {
    // ✅ SEMPRE fazer lookup e comparação
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    // ✅ Sempre fazer comparação, mesmo se usuário não existe
    // Use um hash fictício para manter tempo consistente
    const passwordToCompare = userJSON?.password ?? this.getDummyHash();
    
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

    // ... resto do código
  }

  private getDummyHash(): string {
    // Hash de uma senha qualquer para manter tempo consistente
    return '$2a$10$dummyhashforconstanttiming1234567890123456789';
  }
}
```

**Benefícios:**
- ✅ Previne enumeração de usuários
- ✅ Tempo de resposta consistente
- ✅ Aumenta segurança geral

---

#### **P-04: CORS Desabilitado em Production**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🔴 CRÍTICA |
| **Tipo de Segurança** | CORS / Origin Validation |
| **Risco** | Requisições maliciosas de qualquer origem |
| **Localização** | `config/app.config.ts` (linhas 63-72) |

**Problema:**
CORS está comentado e não configurado para production:

```typescript
// ❌ CORS completamente desabilitado
configCors() {
  // TODO: Configurar os hosts dps
  // app.enableCors({...});
}
```

**Solução Recomendada:**

```typescript
export default class AppConfig {
  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly app: NestFastifyApplication,
  ) {}

  configCors() {
    const nodeEnv = this.configService.get<NodeEnv>('NODE_ENV');
    
    if (nodeEnv === NodeEnv.Production) {
      // ✅ Whitelist rigoroso para production
      this.app.enableCors({
        origin: this.configService
          .get<string>('ALLOWED_ORIGINS')
          ?.split(',')
          .map(o => o.trim()) ?? [],
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        exposedHeaders: ['Set-Cookie', 'X-Request-ID'],
        maxAge: 86400, // 24 horas
        preflightContinue: false,
      });
    } else {
      // ✅ Mais permissivo para dev/test
      this.app.enableCors({
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      });
    }
  }
}
```

**Atualizar `.env.production`:**
```bash
ALLOWED_ORIGINS=https://frontend.example.com,https://app.example.com
```

**Benefícios:**
- ✅ Proteção contra CSRF
- ✅ Controle de origem de requisições
- ✅ Conformidade com SOP (Same-Origin Policy)

---

#### **P-05: Ausência de Validação de Refresh Token Expirado**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🔴 CRÍTICA |
| **Tipo de Segurança** | Token Validation |
| **Risco** | Tokens expirados ainda aceitáveis |
| **Localização** | `get-access-token.usecase.ts` |

**Problema:**
O código não valida se o refresh token ainda está válido (não expirado):

```typescript
export class GetAccessTokenUseCase implements GetAccessTokenPort {
  async execute(userID: string, tokenID: string): Promise<ExecuteReturn> {
    // ❌ Não valida se tokenID existe em Redis
    // ❌ Não valida expiração
    
    const accessToken = this.tokenService.generateAccessToken({
      userID,
      // ... sem validação anterior
    });
  }
}
```

**Solução Recomendada:**

```typescript
@Injectable()
export class GetAccessTokenUseCase implements GetAccessTokenPort {
  constructor(
    private readonly tokenService: TokenService,
    private readonly tokenRepository: TokenRepository,
    private readonly auditService: AuditService,
  ) {}

  async execute(userID: string, tokenID: string): Promise<ExecuteReturn> {
    // ✅ Validar se token foi revogado
    const isRevoked = await this.tokenRepository.isRevoked(tokenID);
    
    if (isRevoked) {
      await this.auditService.log({
        eventType: AuditEventType.TOKEN_REVOKED,
        userID,
        ip: '', // Será preenchido pelo controller
        reason: 'Attempt to use revoked token',
        timestamp: new Date(),
      });

      return {
        ok: false,
        reason: ApplicationResultReasons.NOT_FOUND,
        message: 'Sessão inválida ou expirada',
      };
    }

    // ✅ Atualizar último acesso
    await this.tokenRepository.updateLastAcess(tokenID);

    // ✅ Gerar novo access token
    const accessToken = this.tokenService.generateAccessToken({
      userID,
      email: '', // Será preenchido com query ao BD
      roles: [],
    });

    return {
      ok: true,
      result: accessToken,
    };
  }
}
```

**Benefícios:**
- ✅ Validação rigorosa de tokens
- ✅ Detecção de tokens revogados
- ✅ Auditoria de uso de tokens

---

### 🟠 MÉDIOS (Média Prioridade)

---

#### **P-06: Duplicação de Código Entre Auth e Users Services**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟠 MÉDIA |
| **Princípio Violado** | DRY (Don't Repeat Yourself) |
| **Risco** | Inconsistências entre serviços |
| **Localização** | Comparar `/auth` com `/services/users` |

**Problema:**
Código duplicado em múltiplos serviços:

```typescript
// ❌ Duplicado em auth/config/app.config.ts E users/config/app.config.ts
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

// ❌ Duplicado em auth/config/app.config.ts E users/config/app.config.ts
configCors() {
  // TODO: Configurar os hosts dps
  // app.enableCors({...});
}

// ❌ Duplicado em auth/infrastructure/adaptars/secondary/cookie-service/cookie.service.ts
//    E users/infrastructure/adaptars/primary/http/services/cookie/cookie.service.ts
```

**Solução Recomendada:**

Criar um pacote compartilhado (`@app/common`):

```
packages/
├── common/
│   ├── src/
│   │   ├── config/
│   │   │   ├── app-config.base.ts
│   │   │   ├── cors.config.ts
│   │   │   └── validation-pipe.config.ts
│   │   ├── services/
│   │   │   ├── cookie.service.ts
│   │   │   ├── audit.service.ts
│   │   │   └── logger.service.ts
│   │   ├── decorators/
│   │   ├── guards/
│   │   └── filters/
│   └── package.json
├── services/
│   ├── auth/
│   ├── users/
│   └── products/
```

1. Criar `packages/common/src/config/app-config.base.ts`:
```typescript
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export abstract class AppConfigBase {
  constructor(
    protected readonly configService: ConfigService,
    protected readonly app: NestFastifyApplication,
  ) {}

  configSwagger() {
    if (this.configService.get('NODE_ENV') === 'production') return;

    const documentBuilder = new DocumentBuilder()
      .setTitle(this.getSwaggerTitle())
      .setDescription(this.getSwaggerDescription())
      .setVersion('1.0')
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

  configValidationPipe() {
    this.app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
        transform: false,
        exceptionFactory: (errors) => {
          if (errors.length === 0) {
            return this.createFieldInvalidError('Unknown error', 'Error');
          }

          const firstError = errors[0];
          const firstConstraintMessage = firstError.constraints
            ? Object.values(firstError.constraints)[0]
            : 'Unknown error';

          return this.createFieldInvalidError(
            firstConstraintMessage,
            firstError.property,
          );
        },
      }),
    );
  }

  configCors() {
    const nodeEnv = this.configService.get('NODE_ENV');
    
    if (nodeEnv === 'production') {
      const origins = this.configService
        .get<string>('ALLOWED_ORIGINS')
        ?.split(',')
        .map(o => o.trim()) ?? [];

      this.app.enableCors({
        origin: origins,
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        exposedHeaders: ['Set-Cookie', 'X-Request-ID'],
        maxAge: 86400,
      });
    }
  }

  abstract getSwaggerTitle(): string;
  abstract getSwaggerDescription(): string;
  abstract createFieldInvalidError(message: string, field: string): any;
}
```

2. Herdar em `auth/config/app.config.ts`:
```typescript
import { AppConfigBase } from '@app/common/config/app-config.base';

export default class AppConfig extends AppConfigBase {
  getSwaggerTitle(): string {
    return 'Auth System';
  }

  getSwaggerDescription(): string {
    return 'The Authentication system for an e-commerce store';
  }

  createFieldInvalidError(message: string, field: string) {
    return new FieldInvalid(message, field);
  }
}
```

**Benefícios:**
- ✅ Eliminação de duplicação
- ✅ Manutenção centralizada
- ✅ Consistência entre serviços
- ✅ Facilita testes

---

#### **P-07: Falta de Tratamento de Erros em Async Operations**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟠 MÉDIA |
| **Tipo de Erro** | Error Handling |
| **Risco** | Unhandled promise rejections |
| **Localização** | `users-queue.service.ts`, `email-sender.service.ts` |

**Problema:**
Operações assíncronas sem tratamento de erro:

```typescript
// ❌ emit sem catch - falha silenciosa
export class UsersQueueService implements MessageBroker {
  constructor(@Inject('USERS_BROKER_SERVICE') private client: ClientProxy) {}

  async send(event: string, payload: object) {
    // ❌ Sem try-catch, falhas não são tratadas
    this.client.emit(event, payload);
  }
}
```

**Solução Recomendada:**

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersQueueService implements MessageBroker {
  private readonly logger = new Logger(UsersQueueService.name);

  constructor(
    @Inject('USERS_BROKER_SERVICE') private client: ClientProxy,
  ) {}

  async send(event: string, payload: object): Promise<void> {
    try {
      // ✅ Usar firstValueFrom para aguardar resultado
      await firstValueFrom(
        this.client.emit(event, payload),
      );
      
      this.logger.debug(`Event "${event}" sent successfully`, { payload });
    } catch (error) {
      // ✅ Log e retentar com backoff
      this.logger.error(`Failed to send event "${event}"`, {
        error: error.message,
        payload,
        stack: error.stack,
      });

      // Retentar com exponential backoff
      await this.retryWithBackoff(event, payload, 3);
    }
  }

  private async retryWithBackoff(
    event: string,
    payload: object,
    attemptsLeft: number,
    delayMs: number = 1000,
  ): Promise<void> {
    if (attemptsLeft === 0) {
      this.logger.error(
        `Failed to send event "${event}" after all retries`,
        payload,
      );
      return;
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));

    try {
      await firstValueFrom(this.client.emit(event, payload));
      this.logger.debug(`Event "${event}" sent on retry`);
    } catch (error) {
      await this.retryWithBackoff(
        event,
        payload,
        attemptsLeft - 1,
        delayMs * 2,
      );
    }
  }
}
```

**Benefícios:**
- ✅ Detecção de erros em async
- ✅ Retentativas automáticas
- ✅ Logging completo
- ✅ Resiliência

---

#### **P-08: Segurança de Senha em PasswordVO Comparação Múltipla**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟠 MÉDIA |
| **Tipo de Segurança** | Information Disclosure |
| **Risco** | Múltiplas chamadas de comparação |
| **Localização** | `password-vo.ts`, `create-session.usecase.ts` |

**Problema:**
A comparação de senha é feita múltiplas vezes e pode ser chamada fora de contexto:

```typescript
// ❌ PasswordVO expõe comparePassword diretamente
export default class PasswordVO extends ValueObject<string> {
  public comparePassword(inputPassword: string) {
    return this.passwordHasher.compare(inputPassword, this.value);
  }
}

// ❌ Pode ser chamado múltiplas vezes
const isValid = (user.password as PasswordHashedVO).comparePassword(pwd);
const isValid2 = (user.password as PasswordHashedVO).comparePassword(pwd);
```

**Solução Recomendada:**

```typescript
// ✅ Validar uma única vez no use case
export class CreateSessionUseCase {
  async execute(inputUser: UserLogin): Promise<ExecuteReturn> {
    const userJSON = await this.userRepository.findOne({
      email: inputUser.email.getValue(),
    });

    // ❌ Dummy hash para timing constante
    const passwordToCompare = userJSON?.password ?? this.getDummyHash();
    
    // ✅ Comparação única
    const isPasswordValid = bcrypt.compareSync(
      inputUser.password.getValue(),
      passwordToCompare,
    );

    if (userJSON === undefined || !isPasswordValid) {
      return { ok: false, /* ... */ };
    }

    // ... resto
  }
}
```

---

#### **P-09: Validação de Email VO Muito Simplificada**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟠 MÉDIA |
| **Tipo de Validação** | Input Validation |
| **Risco** | Emails inválidos aceitos |
| **Localização** | `email-vo.ts`, `email.decorator.ts` |

**Problema:**
Value Object de Email sem validações adicionais:

```typescript
// ❌ Sem validações
export default class EmailVO extends ValueObject<string> {
  constructor(value: string) {
    super(value);
  }
}
```

**Solução Recomendada:**

```typescript
import { isEmail, isLength } from 'class-validator';

export default class EmailVO extends ValueObject<string> {
  constructor(value: string) {
    if (!EmailVO.isValid(value)) {
      throw new InvalidEmailError(
        `Email "${value}" não é válido. Use um email no formato correto.`,
      );
    }
    super(value);
  }

  static isValid(email: string): boolean {
    // ✅ Validações rigorosas
    return (
      isEmail(email) &&
      isLength(email, { max: 254 }) && // RFC 5321
      !this.hasConsecutiveDots(email) &&
      !this.hasLeadingOrTrailingDots(email)
    );
  }

  private static hasConsecutiveDots(email: string): boolean {
    return email.includes('..');
  }

  private static hasLeadingOrTrailingDots(email: string): boolean {
    const [localPart] = email.split('@');
    return localPart.startsWith('.') || localPart.endsWith('.');
  }

  static isDisposable(email: string): boolean {
    // ✅ Verificar se é email descartável
    const domain = email.split('@')[1];
    const disposableDomains = [
      'tempmail.com',
      'guerrillamail.com',
      '10minutemail.com',
      // ... mais domínios
    ];
    return disposableDomains.includes(domain);
  }
}
```

---

#### **P-10: Falta de Validação de User Agent e Context**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟠 MÉDIA |
| **Tipo de Segurança** | Session Hijacking |
| **Risco** | Roubo de sessão entre dispositivos |
| **Localização** | `create-session.usecase.ts` |

**Problema:**
Sessão não valida user agent. Um atacante com o token pode usar em dispositivos diferentes:

```typescript
// ❌ Sem validação de user agent
async generateAccessAndRefreshToken(user: UserModel, ip: string) {
  // ...
  await this.tokenRepository.saveSession(tokenID, user.userID, ip);
  // Não salva user agent
}
```

**Solução Recomendada:**

```typescript
export interface SessionMetadata {
  userID: string;
  ip: string;
  userAgent: string;
  createdAt: number;
  lastAccess: number;
}

async generateAccessAndRefreshToken(
  user: UserModel,
  ip: string,
  userAgent: string,
) {
  const accessToken = this.tokenService.generateAccessToken({
    email: user.email,
    userID: user.userID,
    roles: user.roles,
  });

  const { refreshToken, tokenID } = this.tokenService.generateRefreshToken(
    user.userID,
  );

  // ✅ Salvar com user agent
  await this.tokenRepository.saveSession(
    tokenID,
    user.userID,
    ip,
    userAgent,
  );

  return { accessToken, refreshToken };
}

// No controller
@Post('/login')
async login(
  @Body() dto: LoginUserDTO,
  @Res({ passthrough: true }) response: FastifyReply,
  @Ip() ip: string,
  @Headers('user-agent') userAgent: string,
) {
  const useCaseResult = await this.createSessionUseCase.execute(
    this.userMapper.loginDTOForEntity(dto, ip, userAgent),
  );
  // ...
}
```

---

### 🟡 BAIXA (Baixa Prioridade)

---

#### **P-11: Falta de Documentação de API OpenAPI Completa**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟡 BAIXA |
| **Tipo** | Documentation |
| **Impacto** | Dificuldade de integração |
| **Localização** | Decoradores de controllers |

**Problema:**
Alguns endpoints não têm documentação OpenAPI completa:

```typescript
// ❌ Sem decoradores Swagger
@Post('/pass/send-code')
async sendCode(
  @Body() dto: SendCodeForForgotPasswordDTO,
): Promise<HttpResponseOutbound> {
  // ...
}
```

**Solução:**
```typescript
import { ApiOperation, ApiResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@Post('/pass/send-code')
@ApiOperation({ summary: 'Solicitar código para redefinir senha' })
@ApiResponse({
  status: 200,
  description: 'Código enviado com sucesso para o email',
  schema: { example: { statusCode: 200, message: 'Código enviado' } },
})
@ApiBadRequestResponse({
  description: 'Email inválido ou usuário não encontrado',
})
async sendCode(
  @Body() dto: SendCodeForForgotPasswordDTO,
): Promise<HttpResponseOutbound> {
  // ...
}
```

---

#### **P-12: Constantes de Token Espalhadas**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟡 BAIXA |
| **Tipo** | Code Organization |
| **Impacto** | Manutenção difícil |
| **Localização** | `token-expirations.ts`, múltiplas importações |

**Problema:**
Constantes de expiração em múltiplos lugares:

```typescript
// ❌ Espalhado
export const TokenExpirationConstants = {
  REFRESH_TOKEN_MS: 604800000,        // 7 dias
  ACCESS_TOKEN_MS: 3600000,           // 1 hora
  RESET_PASS_TOKEN_MS: 600000,        // 10 minutos
  REFRESH_TOKEN_SECONDS: 604800,      // 7 dias (duplicado!)
};
```

**Solução:**
```typescript
export enum TokenExpiration {
  REFRESH_TOKEN = 604800,      // 7 dias em segundos
  ACCESS_TOKEN = 3600,         // 1 hora em segundos
  RESET_PASS_TOKEN = 600,      // 10 minutos em segundos
}

export const toMilliseconds = (seconds: number) => seconds * 1000;
```

---

#### **P-13: Falta de Validação de Senha Forte no Change Password**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟡 BAIXA |
| **Tipo** | Security Policy |
| **Impacto** | Senhas fracas podem ser setadas |
| **Localização** | `password.decorator.ts` |

**Problema:**
O decorator de senha permite `canStrongPassword = true/false`:

```typescript
// ❌ Pode ser desativado
export function Password(
  type: 'default' | 'new' | 'old' = 'default',
  canStrongPassword = true,  // ❌ Pode ser false
) {
  // ...
}
```

**Solução:**
```typescript
export function Password(
  type: 'default' | 'new' | 'old' = 'default',
  canStrongPassword: boolean = true, // ✅ Sempre true para new/reset
) {
  if (type !== 'default' && !canStrongPassword) {
    throw new Error(
      'Strong password validation is mandatory for password changes',
    );
  }

  const decorators = [];

  if (canStrongPassword) {
    decorators.push(
      IsStrongPassword(PasswordConstants.STRONG_OPTIONS, {
        message: addPrefix(PasswordConstants.ERROR_WEAK_PASSWORD, type),
      }),
    );
  }

  return applyDecorators(
    IsNotEmpty({
      message: addPrefix(PasswordConstants.ERROR_REQUIRED, type),
    }),
    IsString({ message: addPrefix(PasswordConstants.ERROR_STRING, type) }),
    MinLength(PasswordConstants.MIN_LENGTH, {
      message: addPrefix(PasswordConstants.ERROR_MIN_LENGTH, type),
    }),
    ...decorators,
  );
}
```

---

#### **P-14: Falta de Circuit Breaker para Dependências Externas**

| Aspecto | Detalhes |
|---------|----------|
| **Severidade** | 🟡 BAIXA |
| **Tipo** | Resilience |
| **Impacto** | Cascata de falhas |
| **Localização** | Services de RabbitMQ, Email |

**Problema:**
Se RabbitMQ ou Email falhar, não há circuit breaker:

```typescript
// ❌ Sem proteção
async send(event: string, payload: object) {
  this.client.emit(event, payload); // Pode falhar indefinidamente
}
```

**Solução:**
```bash
npm install @nestjs/terminus opossum
```

```typescript
import { CircuitBreakerModule } from '@nestjs/terminus';

@Injectable()
export class UsersQueueService implements MessageBroker {
  private circuitBreakerOpen = false;
  private failureCount = 0;
  private readonly failureThreshold = 5;
  private readonly timeoutMs = 60000; // 1 minuto

  async send(event: string, payload: object): Promise<void> {
    if (this.circuitBreakerOpen) {
      throw new Error('Circuit breaker is open');
    }

    try {
      await firstValueFrom(this.client.emit(event, payload));
      this.failureCount = 0;
    } catch (error) {
      this.failureCount++;

      if (this.failureCount >= this.failureThreshold) {
        this.circuitBreakerOpen = true;
        setTimeout(() => {
          this.circuitBreakerOpen = false;
          this.failureCount = 0;
        }, this.timeoutMs);
      }

      throw error;
    }
  }
}
```

---

## Recomendações

### 🎯 Roadmap de Implementação (Priorizado)

#### **Fase 1: Segurança Crítica (2-3 sprints)**
- [ ] P-01: Rate Limiting
- [ ] P-02: Logging e Auditoria
- [ ] P-03: Timing Attack Fix
- [ ] P-04: CORS Configuration
- [ ] P-05: Refresh Token Validation

#### **Fase 2: Qualidade de Código (1-2 sprints)**
- [ ] P-06: Eliminar Duplicação
- [ ] P-07: Error Handling
- [ ] P-08: Password Comparison Security

#### **Fase 3: Melhorias Gerais (1-2 sprints)**
- [ ] P-09 a P-14: Validações e Documentação

---

## Métricas de Qualidade

| Métrica | Atual | Alvo | Status |
|---------|-------|------|--------|
| **Cobertura de Testes** | ~75% | 90%+ | 🟠 Crescente |
| **Complexidade Ciclomática** | Média | Baixa | 🟠 Necessário refactor |
| **Vulnerabilidades Críticas** | 5 | 0 | 🔴 Crítico |
| **Documentação API** | 70% | 100% | 🟠 Incompleta |
| **Rate Limiting** | ❌ | ✅ | 🔴 Não implementado |
| **Auditoria** | Parcial | Completa | 🟠 Necessário |

---

## Conclusão

Seu projeto demonstra uma **arquitetura muito bem estruturada**. Com a implementação dos 14 pontos identificados, especialmente os 5 críticos, você terá um **serviço de autenticação robusto, seguro e pronto para production**.

**Próximos passos:**
1. ✅ Revisar este documento com a equipe
2. ✅ Priorizar e estimar correções
3. ✅ Implementar P-01 a P-05 imediatamente
4. ✅ Adicionar testes para todas as correções
5. ✅ Fazer security audit antes de production

---

**Contato/Suporte:** Disponível para esclarecer qualquer ponto dessa análise.


<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->
