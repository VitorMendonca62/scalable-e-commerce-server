# Performance & Scalability Review - NestJS Auth Service

## Context

- Servico analisado: auth
- Arquitetura: microservicos com API Gateway
- Foco: gargalos de performance, escalabilidade e resiliencia em producao

## Problemas encontrados (priorizados)

### [HIGH] Crescimento ilimitado de sessoes no Redis + revogacao O(N)
- Problema: `session:${userID}` nao tem TTL e cresce indefinidamente. `revokeAllSessions` carrega todos os tokens com `smembers`, podendo explodir memoria e latencia para usuarios com muitas sessoes.
- Evidencia: [src/modules/auth/infrastructure/adaptars/secondary/database/repositories/redis-token.repository.ts](src/modules/auth/infrastructure/adaptars/secondary/database/repositories/redis-token.repository.ts#L15-L57)
- Impacto: Degradacao progressiva do Redis, picos de latencia e uso de memoria; risco de indisponibilidade.
- Sugestao:
  - Definir TTL para `session:${userID}` igual ao maior tempo de vida do refresh.
  - Evitar `smembers` em lotes grandes; usar `SSCAN` ou estruturar por `ZSET` com expurgo por score.
- Exemplo:
```ts
await this.redis.expire(sessionKey, TokenExpirationConstants.REFRESH_TOKEN_SECONDS);
```

### [HIGH] Bug no pipeline de revogacao pode impedir limpeza
- Problema: `pipeline.unlink(chunk)` recebe array como chave unica, entao tokens nao sao removidos.
- Evidencia: [src/modules/auth/infrastructure/adaptars/secondary/database/repositories/redis-token.repository.ts](src/modules/auth/infrastructure/adaptars/secondary/database/repositories/redis-token.repository.ts#L48-L57)
- Impacto: crescimento ilimitado de chaves, piorando performance ao longo do tempo.
- Sugestao:
```ts
pipeline.unlink(...chunk);
```

### [HIGH] Refresh token faz lookup no Mongo a cada chamada
- Problema: `get-access-token` consulta Mongo para recuperar dados do usuario em todo refresh.
- Evidencia: [src/modules/auth/application/use-cases/get-access-token.usecase.ts](src/modules/auth/application/use-cases/get-access-token.usecase.ts#L16-L33)
- Impacto: Hot path altamente sensivel a carga, com aumento de latencia e uso de conexoes do Mongo.
- Sugestao:
  - Cachear `SessionUser` no Redis com TTL e invalidacao por evento.
  - Validar refresh JWT e emitir access token com claims embutidas, reduzindo chamadas ao banco.

### [HIGH] Dependencia fragil do RabbitMQ no startup
- Problema: erros de conexao sao apenas logados; o servico pode iniciar sem broker e perder eventos.
- Evidencia: [src/config/message-broker/rabbitmq.config.ts](src/config/message-broker/rabbitmq.config.ts#L7-L35)
- Impacto: perda silenciosa de mensagens, inconsistencia entre servicos e retrabalho operacional.
- Sugestao:
  - Fail fast quando broker indisponivel em producao.
  - Adicionar retry/backoff e health check.

### [MEDIUM] Envio de email sem await e sem timeouts
- Problema: envio de email nao e aguardado e nao ha timeouts configurados no SMTP.
- Evidencia: [src/modules/auth/infrastructure/adaptars/secondary/email-sender/nodemailer.service.ts](src/modules/auth/infrastructure/adaptars/secondary/email-sender/nodemailer.service.ts)
- Impacto: concorrencia nao controlada, falhas silenciosas e uso excessivo de recursos.
- Sugestao:
  - `await` no envio e timeouts no transporte.
  - Adicionar retry com backoff para falhas transitorias.

### [MEDIUM] Observabilidade insuficiente
- Problema: logging HTTP desabilitado e filtro de excecoes nao registra erros inesperados.
- Evidencia:
  - [src/main.ts](src/main.ts#L52-L59)
  - [src/modules/auth/infrastructure/adaptars/primary/http/filters/http-exceptions-filter.ts](src/modules/auth/infrastructure/adaptars/primary/http/filters/http-exceptions-filter.ts#L1-L32)
- Impacto: dificulta identificar gargalos e incidentes em alta carga.
- Sugestao:
  - Habilitar logger estruturado e correlacao por traceId.
  - Exportar metricas (latencia, erros, throughput) e tracing distribuido.

### [MEDIUM] Offline queue do Redis pode acumular backlog ilimitado
- Problema: `enableOfflineQueue: true` permite aculo de comandos durante indisponibilidade.
- Evidencia: [src/config/database/redis.config.ts](src/config/database/redis.config.ts#L12-L31)
- Impacto: memoria crescente e latencia quando o Redis retorna.
- Sugestao:
  - Desabilitar offline queue ou impor limites; aplicar timeouts e circuit breaker.

### [MEDIUM] Configuracao do Mongo sem limites de pool e timeouts
- Problema: defaults podem gerar tempos altos de falha e tempestade de reconexoes.
- Evidencia: [src/config/database/mongo.config.ts](src/config/database/mongo.config.ts#L15-L36)
- Impacto: latencia e instabilidade em cargas altas.
- Sugestao:
```ts
maxPoolSize: 50,
minPoolSize: 5,
serverSelectionTimeoutMS: 5000,
socketTimeoutMS: 20000,
```

### [LOW] DLQ sem indice para ordenacao
- Problema: ordenar por `failedAt` sem indice leva a scan com crescimento do DLQ.
- Evidencia:
  - [src/modules/auth/infrastructure/adaptars/secondary/database/repositories/mongoose-dql.repository.ts](src/modules/auth/infrastructure/adaptars/secondary/database/repositories/mongoose-dql.repository.ts#L25-L33)
  - [src/modules/auth/infrastructure/adaptars/secondary/database/models/dlq.model.ts](src/modules/auth/infrastructure/adaptars/secondary/database/models/dlq.model.ts)
- Impacto: latencia crescente na reprocessamento de mensagens.
- Sugestao: criar indice em `failedAt` e `lastRetryAt`.

### [LOW] Publicacao de eventos sem tratamento de erro
- Problema: `sendUserCreatedWithGoogle` nao trata falhas, e nao ha backpressure.
- Evidencia:
  - [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L95-L104)
  - [src/modules/auth/infrastructure/adaptars/secondary/message-broker/queue.service.ts](src/modules/auth/infrastructure/adaptars/secondary/message-broker/queue.service.ts)
- Impacto: perda silenciosa de eventos em alta carga.
- Sugestao: `await` + retry/backoff ou fila interna de envio.

## Recomendacoes prioritarias

1. Corrigir armazenamento de sessoes no Redis: TTL no `session:*`, bug do `unlink`, e estrategia de revogacao escalavel.
2. Remover lookup no Mongo do refresh token com cache/claims e invalidacao.
3. Endurecer o broker: fail fast, retry/backoff, health check e politica de reconexao.
4. Melhorar observabilidade: logs estruturados, metricas e tracing distribuido.
5. Ajustar configs de Redis/Mongo para alta carga (pool, timeouts, circuit breaker).
6. Indexar DLQ e otimizar reprocessamento.

## Exemplos de melhorias (codigo)

### Redis: revogacao com unlink correto
```ts
for (let i = 0; i < tokens.length; i += chunkSize) {
  const chunk = tokens.slice(i, i + chunkSize);
  pipeline.unlink(...chunk);
}
```

### Mongo: pool e timeouts
```ts
return {
  uri: `mongodb://${host}/auth`,
  maxPoolSize: 50,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 20000,
  // ...
};
```

### Email: await + timeout
```ts
await this.transporter.sendMail({
  from,
  to,
  subject,
  html,
});
```
