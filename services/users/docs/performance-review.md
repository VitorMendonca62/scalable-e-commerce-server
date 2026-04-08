# Performance Review - Users Service

## Visao Geral
Este documento cobre riscos de performance, escalabilidade e sistemas distribuidos no servico de users (NestJS), com foco em impacto real em producao sob alta carga.

## 1. Problemas Encontrados (por severidade)

### Alto
1) Blocking de CPU no hot path (bcrypt sync)
- Problema: hash sincrono bloqueia o event loop e derruba throughput em concorrencia.
- Impacto: picos de latencia, fila de requisicoes, piora de tail latency.
- Recomendacao: usar hashing async ou offload para worker pool.
- Exemplo:
```ts
const hash = await bcrypt.hash(rawPassword, saltRounds);
```

2) Envio de email fire-and-forget
- Problema: send nao eh aguardado; falhas somem e a API pode retornar sucesso mesmo com erro.
- Impacto: experiencia inconsistente, sem retry, falhas silenciosas.
- Recomendacao: await do envio com timeout e politica de retry/backoff.
- Exemplo:
```ts
const send = mailer.sendMail(payload);
await Promise.race([
  send,
  new Promise((_, reject) => setTimeout(() => reject(new Error("mail timeout")), 3000)),
]);
```

3) Retry de DLQ sem coordenacao entre instancias
- Problema: varias instancias podem retryar a mesma mensagem ao mesmo tempo.
- Impacto: duplicacao de efeitos colaterais e inconsistencias.
- Recomendacao: lock distribuido ou claim via DB com SKIP LOCKED + next_retry_at.

### Medio
4) Conexao com broker nao aguardada
- Problema: servico pode ficar healthy enquanto o broker esta indisponivel.
- Impacto: perda de eventos e atrasos em efeitos colaterais.
- Recomendacao: conectar no onModuleInit e falhar rapido ou degradar readiness.

5) Falhas de publish ignoradas nos handlers HTTP
- Problema: HTTP retorna sucesso mesmo se o publish falhar.
- Impacto: drift entre servicos.
- Recomendacao: outbox + relay, ou retornar 202 e processar de forma assincrona.

6) Limite de enderecos nao atomico
- Problema: count + insert pode correr em paralelo e passar do limite.
- Impacto: quebra de integridade sob concorrencia.
- Recomendacao: transacao com SELECT FOR UPDATE ou constraint no banco.

7) Leitura redundante antes do delete
- Problema: read extra antes do delete aumenta latencia e carga no DB.
- Impacto: desperdicio em escala.
- Recomendacao: delete com WHERE e validar affected rows.

8) Redis offline queue habilitado
- Problema: comandos podem se acumular em memoria durante outage.
- Impacto: risco de memory blowup e falhas em cascata.
- Recomendacao: desabilitar offline queue ou limitar com circuit breaker e backoff.

9) Pool/timeouts de DB nao configurados
- Problema: sem limites claros de pool e timeouts.
- Impacto: exaustao de conexoes e requests travadas.
- Recomendacao: definir pool, connectionTimeout e query/statement timeouts.

### Baixo
10) Request logging desabilitado
- Problema: pouca observabilidade para latencia e erros.
- Impacto: resposta lenta a incidentes.
- Recomendacao: logging estruturado + trace IDs.

11) Startup de microservices nao aguardado
- Problema: HTTP pode servir antes do broker estar pronto.
- Impacto: falhas nos primeiros requests.
- Recomendacao: aguardar o start do microservice antes do listen.

12) Consumer externo sem idempotencia
- Problema: read-then-create pode duplicar em retries.
- Impacto: duplicatas em entregas repetidas.
- Recomendacao: upsert ou tratar unique constraint como sucesso.

## 2. Plano de Acao Recomendado
1) Corrigir blocking de CPU (bcrypt async) e await no envio de email com timeout.
2) Garantir publish duravel (outbox) e readiness do broker.
3) Tornar regras de enderecos atomicas e remover queries redundantes.
4) Definir pool/timeouts e limites para Redis em falhas.
5) Melhorar observabilidade (logs, metricas, tracing).

## 3. Observacoes
- O foco eh risco real em producao, evitando micro-otimizacoes.
- Posso implementar os itens prioritarios ou desenhar um outbox/circuit-breaker.
