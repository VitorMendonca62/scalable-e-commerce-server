
# 🔐 Security Audit Report - NestJS Application

## 📌 Executive Summary
A base apresenta validacao de entrada via `ValidationPipe`, mas **nao aplica autenticacao/authorization dentro do microservico**, confiando em headers vindos do gateway. Isso abre **Broken Access Control** se o gateway for contornado. Alem disso, ha **trust excessivo em eventos do broker**, **uso de AMQP sem TLS**, **chave privada em arquivo no repo**, e **exposicao de payloads sensiveis na DLQ**.  

## 🏗️ Architecture Overview & Attack Surface
- **HTTP Controllers** expostos para usuarios e enderecos, consumindo headers `x-user-id` e `x-user-email`.
- **Microservice Consumer** via RabbitMQ (`@EventPattern`) com payloads externos.
- **Infra**: Postgres, Redis, RabbitMQ, SMTP; JWT apenas para signup token.
- **Bootstrap**: sem uso de `helmet` e sem CORS habilitado explicitamente.

## 🚨 Identified Vulnerabilities
### [VULN-001] Broken Access Control por falta de auth/guards no microservico
- Descricao: Endpoints confiam em headers `x-user-id` / `x-user-email` sem verificacao local (nenhum `@UseGuards`). Se o gateway for contornado, qualquer cliente pode acessar/alterar dados de qualquer usuario.
- Impacto: Acesso e modificacao indevida de dados sensiveis (IDOR).
- Severidade: High
- Evidencia no codigo:
  - user.controller.ts
  - user.controller.ts e user.controller.ts
  - address.controller.ts
- Como explorar: Enviar `x-user-id` de outro usuario e chamar PATCH/DELETE/GET em /users ou /address.
- Recomendacao: Implementar auth local (JWT guard/roles) e validacao server-side do `userID` com base no token, nao em header arbitrario.
- Exemplo de correcao: Usar `@UseGuards(JwtAuthGuard)` + extrair `sub` do token para `userID` e validar escopo/roles no service.

### [VULN-002] Trust boundary quebrado em eventos de microservico (payload sem validacao/autenticacao)
- Descricao: O handler de eventos consome payload externo sem validacao/policiamento e persiste diretamente, incluindo `roles` e timestamps.
- Impacto: Escalada de privilegios e criacao de contas com roles arbitrarias se o broker for acessivel ou mensagens forem forjadas.
- Severidade: High
- Evidencia no codigo:
  - user.external.controller.ts
  - user.mapper.ts
- Como explorar: Publicar evento `user-create-google` com `roles` elevadas e `userID` arbitrario.
- Recomendacao: Validar assinatura de mensagens (HMAC/JWT), aplicar DTO + `ValidationPipe` e restringir `roles` ao minimo necessario.
- Exemplo de correcao: Validar payload com DTO e sobrescrever `roles` com valor seguro no service.

### [VULN-003] Exposicao de dados sensiveis na DLQ e eventos do broker
- Descricao: O evento `user-created` inclui `password` (mesmo que hash) e o payload completo pode ser persistido na DLQ sem criptografia/mascara.
- Impacto: Vazamento de hashes e dados pessoais via DLQ/DB.
- Severidade: Medium
- Evidencia no codigo:
  - queue.service.ts
  - typeorm-dql.repository.ts
  - dlq.model.ts
- Como explorar: Acesso indevido ao banco da DLQ ou logs do broker.
- Recomendacao: Remover `password` dos eventos, ou aplicar criptografia/mascara antes de persistir; limitar payloads gravados na DLQ.
- Exemplo de correcao: Substituir `password` por `passwordHashRef` ou remover completamente.

### [VULN-004] RabbitMQ sem TLS (AMQP) em comunicacao interna
- Descricao: Conexao ao broker usa `amqp` sem TLS; credenciais e eventos trafegam em claro.
- Impacto: MITM em rede interna, leitura/alteracao de eventos e credenciais.
- Severidade: High
- Evidencia no codigo:
  - user.module.ts
  - rabbitmq.config.ts
- Como explorar: Sniffing/mitm na rede entre servico e broker.
- Recomendacao: Usar `amqps` com TLS mTLS, rotacionar credenciais e restringir ACLs no broker.
- Exemplo de correcao: Configurar TLS no RMQ e usar `amqps` com certificados.

### [VULN-005] Chave privada em arquivo no repo e carregada diretamente
- Descricao: A chave privada usada para assinar tokens esta em arquivo local dentro do projeto.
- Impacto: Exposicao da chave permite forjar tokens.
- Severidade: Critical
- Evidencia no codigo:
  - user.module.ts
  - Arquivo presente no repo
- Como explorar: Acesso ao repo/artefato da imagem do container.
- Recomendacao: Mover chaves para KMS/secret manager; nunca commit em repo; usar env/volume seguro.
- Exemplo de correcao: Carregar chave de `ENV` via secret manager e habilitar rotacao.

### [VULN-006] Validacao ausente para `x-user-email` (header)
- Descricao: O email usado no create vem do header sem validacao. As `ValueObject` nao validam, logo um header malicioso passa.
- Impacto: Email invalido armazenado, possivel bypass de regras de negocio e inconsistencias.
- Severidade: Medium
- Evidencia no codigo:
  - user.controller.ts
  - value-object.ts
- Como explorar: Enviar email invalido ou malicioso no header.
- Recomendacao: Validar header com DTO/pipes ou mover email para body com `class-validator`.
- Exemplo de correcao: Criar DTO com `@IsEmail()` e usar `@Headers()` + `ValidationPipe`.

### [VULN-007] Falta de hardening HTTP (CORS/Helmet)
- Descricao: CORS nao esta habilitado e nao ha configuracao de headers de seguranca (Helmet).
- Impacto: Defesa fraca contra ataques web (XSS/CSRF) dependendo do uso.
- Severidade: Medium
- Evidencia no codigo:
  - app.config.ts
  - main.ts
- Como explorar: Em contextos browser, ausencia de politicas pode permitir abuso.
- Recomendacao: Habilitar CORS com origem permitida e usar `@fastify/helmet`.
- Exemplo de correcao: `app.register(helmet, { contentSecurityPolicy: ... })` e `app.enableCors({ origin: [...] })`.

## 🔄 Microservices Security Risks
- **Broker sem autenticacao forte/mTLS** abre risco de eventos falsos e replay.
- **Handlers sem validacao** permitem payloads malformados ou escalada de privilegios.
- **DLQ armazena payload bruto** (incluindo dados sensiveis).

## 🚪 API Gateway Analysis
- Pontos fortes: Rate limiting e auth centralizados no gateway reduzem carga nos servicos.
- Possiveis falhas: Sem defense-in-depth no microservico, qualquer bypass do gateway compromete autorizacao e dados.

## ⚠️ Security Misconfigurations & Bad Practices
- Chave privada versionada no repo.
- RabbitMQ trafegando sem TLS.
- CORS e headers de seguranca nao configurados.
- Dependencia exclusiva do gateway para autenticacao/autorizacao.

## ✅ Priority Recommendations
1. **Implementar autenticacao e autorizacao dentro do microservico** (guards e validacao de `userID` via token).
2. **Remover chaves privadas do repo e usar secret manager**; rotacao imediata.
3. **Habilitar TLS/mTLS para RabbitMQ** e restringir ACLs.
4. **Validar payloads de eventos** e aplicar schema/DTO + assinatura de mensagens.
5. **Remover dados sensiveis de eventos e DLQ** ou criptografar payloads.
6. **Ativar Helmet e CORS com origem restrita**.

Se quiser, posso gerar um checklist de correcoes com tarefas pequenas por arquivo.