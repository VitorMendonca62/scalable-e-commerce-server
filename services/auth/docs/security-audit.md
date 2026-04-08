# 🔐 Security Audit Report - NestJS Application

## 📌 Executive Summary

A avaliacao identificou vulnerabilidades criticas relacionadas a autenticacao e recuperacao de senha que permitem bypass do gateway e tomada de conta quando o servico e acessado diretamente. Os principais riscos sao: fluxo de reset de senha sem validacao de token, renovacao de access token baseada apenas em headers controlaveis e ausencia de autenticação forte entre microservicos. Existem boas praticas aplicadas (validacao global, bcrypt, JWT com RS256, mTLS opcional), mas ha gaps de defense in depth, CORS e headers de seguranca nao configurados, e transporte sem TLS para RabbitMQ.

## 🏗️ Architecture Overview & Attack Surface

- Entrada HTTP: endpoints de autenticacao, senha e certificados, expostos pelo NestJS em [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts) e [src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts)
- Entrada de microservico: handlers de eventos RabbitMQ em [src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts)
- Controles globais: filtro de excecoes e ValidationPipe em [src/main.ts](src/main.ts#L52-L71) e [src/config/app.config.ts](src/config/app.config.ts#L48-L71)
- Autenticacao de rede: mTLS opcional no gateway em [src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts](src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts#L21-L52) e configuracao TLS em [src/main.ts](src/main.ts#L19-L38)
- Transporte interno: RabbitMQ usando AMQP sem TLS em [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L12-L32)

## 🚨 Identified Vulnerabilities

### [VULN-001] Reset de senha sem validacao de token
- Descricao: O endpoint de reset usa apenas o header `x-user-email` e nao valida o token de reset emitido no passo anterior. Isso permite reset de senha com email conhecido se o servico for acessado diretamente.
- Impacto: Account takeover total do usuario alvo.
- Severidade: Critical
- Evidencia no codigo:
  - [src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts#L91-L111)
  - [src/modules/auth/application/use-cases/change-password.usecase.ts](src/modules/auth/application/use-cases/change-password.usecase.ts#L63-L81)
- Como explorar: Atacante envia `PATCH /pass/reset` com `x-user-email` de um usuario valido e uma nova senha; nao ha validacao do `ResetPassToken` emitido no `/pass/validate-code`.
- Recomendacao: Validar o JWT de reset (assinatura, expiração e tipo) no endpoint de reset; preferir enviar o token no header `Authorization: Bearer` e extrair o email do `sub` do token.
- Exemplo de correção:
```ts
// Exemplo: Guard para validar reset token
@Injectable()
export class ResetPassJwtGuard extends AuthGuard('jwt-reset-pass') {}

// Controller
@Patch('/reset')
@UseGuards(ResetPassJwtGuard)
async resetPassword(
  @Body() dto: ResetPasswordDTO,
  @Req() req: FastifyRequest & { user: { email: string } },
) {
  return this.changePasswordUseCase.executeReset(req.user.email, dto.newPassword);
}
```

### [VULN-002] Renovacao de access token baseada apenas em headers
- Descricao: O endpoint `/auth/token` confia em `x-user-id` e `x-token-id` sem verificar assinatura de refresh token ou prova criptografica do cliente.
- Impacto: Reemissao de access token por quem obtenha ou adivinhe `tokenID`, permitindo sequestro de sessao.
- Severidade: Critical
- Evidencia no codigo:
  - [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L147-L173)
  - [src/modules/auth/infrastructure/adaptars/primary/http/guards/revocation.guard.ts](src/modules/auth/infrastructure/adaptars/primary/http/guards/revocation.guard.ts#L10-L24)
  - [src/modules/auth/application/use-cases/get-access-token.usecase.ts](src/modules/auth/application/use-cases/get-access-token.usecase.ts#L19-L36)
- Como explorar: Ao acessar o servico diretamente (bypass do gateway), um atacante envia headers `x-user-id` e `x-token-id` validos; o guard apenas verifica revogacao em Redis e a use case emite novo access token.
- Recomendacao: Exigir refresh JWT assinado no `Authorization` e validar assinatura, `kid`, `type` e `sub`; derivar `userID` do token e nao de header.
- Exemplo de correção:
```ts
@UseGuards(JwtRefreshGuard)
@Get('/token')
async getAccessToken(@Req() req) {
  const userID = req.user.sub;
  const tokenID = req.user.jti;
  return this.getAccessTokenUseCase.execute(userID, tokenID);
}
```

### [VULN-003] Falta de autenticacao forte entre microservicos
- Descricao: Handlers de eventos RabbitMQ nao validam autenticacao/assinatura e aceitam payloads sem validacao de schema; o transporte usa AMQP sem TLS.
- Impacto: Comprometimento de dados internos por publicacao de mensagens maliciosas no broker.
- Severidade: High
- Evidencia no codigo:
  - [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L12-L32)
  - [src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts#L14-L33)
  - [src/modules/auth/infrastructure/adaptars/primary/microservices/dtos/create-user.dto.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/dtos/create-user.dto.ts#L1-L9)
- Como explorar: Atacante com acesso ao broker publica evento `user-created` com payload adulterado e cria/atualiza usuarios no banco.
- Recomendacao: Usar `amqps` com TLS, autenticar mensagens (HMAC/JWT assinado entre servicos), e validar DTOs com `class-validator` no consumer.
- Exemplo de correção:
```ts
@EventPattern('user-created')
async createUser(@Payload(new ValidationPipe({ whitelist: true })) dto: CreateExternalUserDTO) {
  // valida assinatura/HMAC antes de processar
}
```

### [VULN-004] Tokens retornados no corpo da resposta sem cookie seguro
- Descricao: Access e refresh tokens sao retornados no body sob nomes de cookies, sem `Set-Cookie` com `HttpOnly`, `Secure` e `SameSite`.
- Impacto: Exposicao a XSS e vazamento de tokens via logs ou clients que armazenam em localStorage.
- Severidade: High
- Evidencia no codigo:
  - [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L107-L113)
  - [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L138-L144)
- Como explorar: Ataques XSS no cliente exfiltram tokens armazenados em JS.
- Recomendacao: Setar `Set-Cookie` com `HttpOnly`, `Secure` e `SameSite=Strict` para refresh token; access token deve ser curto e, preferencialmente, em cookie HttpOnly.
- Exemplo de correção:
```ts
response.setCookie(Cookies.RefreshToken, refreshToken, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  path: '/auth/token',
});
```

### [VULN-005] OAuth sem `state` anti-CSRF
- Descricao: URL do Google OAuth nao inclui `state`/nonce, permitindo CSRF de login.
- Impacto: Vinculacao involuntaria de sessao a conta do atacante.
- Severidade: Medium
- Evidencia no codigo:
  - [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L58-L66)
- Como explorar: Atacante induz o usuario a visitar URL com callback controlado, criando sessao para conta do atacante.
- Recomendacao: Gerar `state` criptografado e verificar no callback; armazenar em cookie com `SameSite`.
- Exemplo de correção:
```ts
const state = crypto.randomUUID();
// persistir state em cookie/redis
return `...&state=${state}`;
```

### [VULN-006] mTLS opcional permite bypass direto ao servico
- Descricao: Quando `MTLS_ENABLED` esta desativado, o guard libera todas as requisicoes HTTP sem autenticacao de gateway.
- Impacto: Bypass completo do API Gateway e de seus controles.
- Severidade: High
- Evidencia no codigo:
  - [src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts](src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts#L24-L28)
  - [src/main.ts](src/main.ts#L19-L38)
- Como explorar: Atacante acessa o servico diretamente, ignorando rate limit e auth do gateway.
- Recomendacao: Tornar mTLS obrigatorio em producao e falhar em init se as variaveis nao estiverem configuradas; bloquear acesso direto com firewall/mesh.
- Exemplo de correção:
```ts
if (this.configService.get('NODE_ENV') === 'production' && !enabled) {
  throw new UnauthorizedException('mTLS required in production.');
}
```

### [VULN-007] Codigo de reset armazenado em claro e sem controle de tentativas
- Descricao: Codigos OTP sao armazenados em texto plano e nao ha limite de tentativas nem rate limiting no fluxo.
- Impacto: Possibilidade de brute force ou vazamento do codigo via acesso a banco.
- Severidade: Medium
- Evidencia no codigo:
  - [src/modules/auth/application/use-cases/forgot-password.usecase.ts](src/modules/auth/application/use-cases/forgot-password.usecase.ts#L27-L51)
- Como explorar: Ataques de brute force em `/pass/validate-code` ou exfiltracao de dados do banco.
- Recomendacao: Armazenar hash do codigo (ex: bcrypt/argon2), limitar tentativas por email/IP e adicionar lockout temporal.
- Exemplo de correção:
```ts
const codeHash = await bcrypt.hash(otpCode, 10);
await emailCodeRepository.save({ email, codeHash, expiresIn });
```

## 🔄 Microservices Security Risks

- Trust boundary indefinido: consumidores RabbitMQ processam eventos sem autenticacao e sem validacao de payloads, o que permite injecao de eventos por qualquer publicador com acesso ao broker. Evidencia em [src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts#L14-L33).
- Transporte interno sem TLS: `amqp` sem `amqps` expõe mensagens e credenciais em transito. Evidencia em [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L12-L22).
- Exposicao de portas internas em compose facilita bypass do gateway e acesso lateral (Mongo/Redis expostos). Evidencia em [docker-compose.yaml](docker-compose.yaml#L18-L35).

## 🚪 API Gateway Analysis

- Pontos fortes
  - Guard global de mTLS para trafego HTTP quando habilitado. Evidencia em [src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts](src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts#L21-L52).
  - Validacao global estrita (`whitelist`, `forbidNonWhitelisted`). Evidencia em [src/config/app.config.ts](src/config/app.config.ts#L48-L71).
- Possiveis falhas
  - Dependencia excessiva do gateway para autenticacao de refresh e reset; o servico aceita headers confiaveis sem validacao criptografica quando acessado diretamente. Evidencia em [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L147-L173) e [src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts#L91-L111).
  - mTLS desativavel em runtime, permitindo bypass total se mal configurado. Evidencia em [src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts](src/modules/auth/infrastructure/adaptars/primary/http/guards/gateway-mtls.guard.ts#L24-L28).

## ⚠️ Security Misconfigurations & Bad Practices

- CORS nao configurado (comentado). Evidencia em [src/config/app.config.ts](src/config/app.config.ts#L35-L46).
- Ausencia de headers de seguranca (Helmet). Nao ha configuracao em [src/main.ts](src/main.ts#L41-L71).
- Filtro de excecoes nao registra erros inesperados, reduzindo visibilidade em incidentes. Evidencia em [src/modules/auth/infrastructure/adaptars/primary/http/filters/http-exceptions-filter.ts](src/modules/auth/infrastructure/adaptars/primary/http/filters/http-exceptions-filter.ts#L31-L38).
- Exposicao de portas internas no compose (Mongo/Redis). Evidencia em [docker-compose.yaml](docker-compose.yaml#L18-L35).
- Swagger habilitado fora de producao sem auth; em ambientes de staging pode vazar schema. Evidencia em [src/config/app.config.ts](src/config/app.config.ts#L14-L33).

## ✅ Priority Recommendations

1. Corrigir reset de senha para validar o JWT de reset (assinatura, exp, `type`) e extrair email do `sub`.
2. Exigir refresh JWT assinado no `/auth/token` e remover confianca em `x-user-id`/`x-token-id`.
3. Implementar autenticacao entre microservicos (mTLS/mesh + assinatura de mensagens) e habilitar `amqps`.
4. Enviar tokens em cookies seguros (`HttpOnly`, `Secure`, `SameSite`) e revisar armazenamento no cliente.
5. Habilitar CORS restritivo e headers de seguranca (Helmet) no bootstrap.
6. Aplicar rate limiting e controle de tentativas no fluxo de reset de senha; armazenar hash do OTP.
7. Bloquear acesso direto aos servicos com firewall/mesh e exigir mTLS em producao.
