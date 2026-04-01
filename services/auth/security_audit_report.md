# 🔐 Security Audit Report - NestJS Application

## 📌 Executive Summary
- O servico de autenticacao aceita headers de identidade (`x-user-id`, `x-token-id`, `x-user-email`) sem validacao criptografica local, permitindo bypass do gateway e escalacao de privilegios.
- O fluxo de reset de senha ignora o token de reset gerado e aceita apenas o email enviado em header, permitindo troca de senha sem prova de posse.
- O refresh de token nao valida o vinculo entre `tokenID` e `userID`, permitindo emitir access token para outro usuario.
- A comunicacao via RabbitMQ usa `amqp` sem TLS e nao ha autenticacao/assinatura de eventos, abrindo caminho para manipulacao de contas.

## 🏗️ Architecture Overview & Attack Surface
- Entradas HTTP:
  - Login e OAuth Google: [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts)
  - Refresh e logout: [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts)
  - Recuperacao e alteracao de senha: [src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts)
- Entradas de microservicos:
  - Eventos de usuario via RabbitMQ: [src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts)
- Configuracoes globais:
  - Bootstrap, CORS, ValidationPipe: [src/main.ts](src/main.ts#L1-L53), [src/config/app.config.ts](src/config/app.config.ts#L63-L94)
  - RabbitMQ (transporte e protocolo): [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L10-L30)

## 🚨 Identified Vulnerabilities

### [VULN-001] Escalacao de privilegio no refresh de token
- Descricao: O endpoint de refresh recebe `x-user-id` e `x-token-id` e apenas verifica se o token nao foi revogado; o use case nao valida se o `tokenID` pertence ao `userID` informado.
- Impacto: Emissao de access token para outro usuario (account takeover).
- Severidade: Critical
- Evidencia no codigo:
  - Headers confiados no refresh: [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L130-L137)
  - Apenas atualiza lastAccess pelo `tokenID`: [src/modules/auth/application/use-cases/get-access-token.usecase.ts](src/modules/auth/application/use-cases/get-access-token.usecase.ts#L19-L32)
  - RevocationGuard nao valida identidade, apenas `tokenID`: [src/modules/auth/infrastructure/adaptars/primary/http/guards/revocation.guard.ts](src/modules/auth/infrastructure/adaptars/primary/http/guards/revocation.guard.ts#L11-L22)
- Como explorar: Obter um `tokenID` valido (da propria conta) e chamar `GET /auth/token` com `x-user-id` de outra vitima; o servico emite um access token para a vitima.
- Recomendacao: Vincular `tokenID` ao `userID` e validar isso no refresh, ou usar refresh token JWT assinado e validar `sub` e `jti` localmente.
- Exemplo de correcao:
```ts
const payload = this.jwtService.verify<JWTRefreshTokenPayLoad>(refreshToken);
if (payload.type !== 'refresh') throw new UnauthorizedException();
const session = await this.tokenRepository.getSession(payload.jti);
if (!session || session.userID !== payload.sub) throw new UnauthorizedException();
```

### [VULN-002] Reset de senha sem validacao do token de reset
- Descricao: O fluxo valida o codigo e emite um token (`reset-pass`), mas o endpoint de reset ignora esse token e aceita apenas `x-user-email`.
- Impacto: Reset arbitrario de senha por atacante que apenas conhece o email.
- Severidade: Critical
- Evidencia no codigo:
  - Token de reset gerado: [src/modules/auth/application/use-cases/forgot-password.usecase.ts](src/modules/auth/application/use-cases/forgot-password.usecase.ts#L70-L79)
  - Token retornado ao cliente: [src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts#L69-L76)
  - Reset usa apenas `x-user-email`: [src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts#L79-L86)
  - Use case valida somente email: [src/modules/auth/application/use-cases/change-password.usecase.ts](src/modules/auth/application/use-cases/change-password.usecase.ts#L55-L71)
- Como explorar: Enviar `PATCH /pass/reset` com `x-user-email` da vitima e nova senha.
- Recomendacao: Exigir e validar o token `reset-pass` (assinatura + `sub` igual ao email) antes de trocar a senha.
- Exemplo de correcao:
```ts
const payload = this.jwtService.verify<JWTResetPassTokenPayLoad>(resetToken);
if (payload.type !== 'reset-pass' || payload.sub !== email) {
  throw new UnauthorizedException();
}
```

### [VULN-003] Autenticacao local ausente (confianca excessiva no gateway)
- Descricao: Endpoints sensiveis dependem de headers fornecidos pelo gateway sem validacao criptografica local. O servico nao valida JWT nem usa guard de autenticacao.
- Impacto: Bypass do gateway permite chamadas autenticadas sem prova de identidade.
- Severidade: High
- Evidencia no codigo:
  - `x-user-id` e `x-token-id` aceitos diretamente: [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L130-L161)
  - Reset de senha por `x-user-email`: [src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/password.controller.ts#L79-L106)
- Como explorar: Acessar o servico diretamente (sem gateway) e forjar headers.
- Recomendacao: Implementar validacao local de JWT (Guard) ou mTLS entre gateway e servico, e recusar requests sem prova criptografica.
- Exemplo de correcao:
```ts
@UseGuards(JwtAuthGuard)
@Get('/token')
async getAccessToken(@Req() req) {
  const userID = req.user.sub;
  // ...
}
```

### [VULN-004] Eventos de microservicos sem autenticacao + RabbitMQ sem TLS
- Descricao: O consumer de eventos aceita payloads sem assinatura e o transporte usa `amqp` (sem TLS).
- Impacto: Qualquer publisher com acesso ao broker pode criar, atualizar ou deletar usuarios.
- Severidade: High
- Evidencia no codigo:
  - `amqp` sem TLS: [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L12-L23)
  - Event handlers sem autenticacao: [src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts#L14-L31)
- Como explorar: Publicar eventos `user-created`, `user-updated` ou `user-deleted` diretamente no broker.
- Recomendacao: Habilitar TLS (`amqps`), usar credenciais com minimo privilegio e assinar mensagens (HMAC ou JWT de servico).
- Exemplo de correcao:
```ts
// Exemplo: validar assinatura HMAC no payload antes de processar
if (!verifyHmac(payload, signature, secret)) throw new UnauthorizedException();
```

### [VULN-005] OAuth sem parametro `state` (CSRF)
- Descricao: URL de OAuth Google e gerada sem `state`, permitindo CSRF no fluxo de login.
- Impacto: Login forçado ou vinculacao de conta indevida.
- Severidade: Medium
- Evidencia no codigo:
  - URL sem `state`: [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L52-L59)
- Como explorar: Atacante inicia fluxo OAuth e força a vitima a concluir o callback.
- Recomendacao: Gerar `state` aleatorio, armazenar e validar no callback.
- Exemplo de correcao:
```ts
const state = randomUUID();
await this.stateStore.save(state, ttl);
return `${baseUrl}&state=${state}`;
```

### [VULN-006] CORS configurado como TODO (configuracao ausente)
- Descricao: A configuracao de CORS esta comentada e nao ha politica explicita de origem/headers.
- Impacto: Comportamento imprevisivel de browser ou exposicao indevida quando habilitado sem restricao.
- Severidade: Medium
- Evidencia no codigo:
  - Metodo `configCors` comentado: [src/config/app.config.ts](src/config/app.config.ts#L63-L74)
- Como explorar: Se CORS for habilitado sem restricao, qualquer origem poderia enviar requests autenticados via cookies.
- Recomendacao: Definir origens permitidas, headers e `credentials: true` de forma explicita.
- Exemplo de correcao:
```ts
app.enableCors({
  origin: ['https://app.exemplo.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## 🔄 Microservices Security Risks
- Eventos de usuario sem assinatura permitem spoofing de create/update/delete: [src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts#L14-L31)
- Transporte sem TLS expõe credenciais e payloads: [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L12-L23)

## 🚪 API Gateway Analysis
- Pontos fortes
  - Centraliza autenticacao e rate limiting.
- Possiveis falhas
  - Dependencia total do gateway para identidade; headers podem ser forjados quando o gateway e contornado.

## ⚠️ Security Misconfigurations & Bad Practices
- CORS nao configurado (TODO comentado): [src/config/app.config.ts](src/config/app.config.ts#L63-L74)
- Falta de autenticacao interna nos handlers de microservicos: [src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts](src/modules/auth/infrastructure/adaptars/primary/microservices/user.external.controller.ts#L14-L31)
- Transporte RMQ sem TLS: [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L12-L23)

## ✅ Priority Recommendations
1) Corrigir o refresh de token: validar `tokenID` + `userID` (ou JWT refresh) antes de emitir access token.
2) Exigir token `reset-pass` no reset de senha e validar assinatura + `sub`.
3) Implementar autenticacao local (JWT guard ou mTLS) em rotas sensiveis.
4) Proteger mensageria: TLS no RabbitMQ e assinatura de eventos.
5) Configurar CORS explicitamente com origens permitidas e `credentials`.
