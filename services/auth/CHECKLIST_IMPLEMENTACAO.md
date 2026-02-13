# ✅ Checklist de Implementação Interativo

**Versão:** 1.0  
**Data de Início:** 13/02/2026  
**Objetivo:** Rastrear implementação de todas as correções

---

## 🔴 FASE 1: CRÍTICOS (Estimado: 17 horas)

### P-01: Rate Limiting
**Prioridade:** 🔴 CRÍTICA | **Impacto:** Alto | **Esforço:** 4h

- [ ] **Etapa 1: Setup (30min)**
  - [ ] `npm install @nestjs/throttler`
  - [ ] Verificar instalação: `npm list @nestjs/throttler`
  - [ ] Documentação: Ler [NestJS Throttler Docs](https://docs.nestjs.com/security/rate-limiting)

- [ ] **Etapa 2: Configurar Auth Module (1h)**
  - [ ] Abrir `src/modules/auth/auth.module.ts`
  - [ ] Importar `ThrottlerModule, ThrottlerGuard`
  - [ ] Adicionar `ThrottlerModule.forRoot()`
  - [ ] Registrar `APP_GUARD`
  - [ ] Validar import: `ng build`

- [ ] **Etapa 3: Aplicar Decoradores (1.5h)**
  - [ ] Abrir `src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts`
  - [ ] Adicionar `@Throttle('short', '5-1m')` em `login`
  - [ ] Adicionar `@Throttle('medium', '10-5m')` em `getGoogleURL`
  - [ ] Adicionar `@Throttle('medium', '20-5m')` em `getAccessToken`
  - [ ] Adicionar `@Throttle('medium', '30-5m')` em `logout`
  - [ ] Abrir `password.controller.ts`
  - [ ] Adicionar `@Throttle('long', '5-15m')` em `updatePassword`
  - [ ] Adicionar `@Throttle('long', '3-15m')` em `sendCode`
  - [ ] Adicionar `@Throttle('medium', '10-5m')` em `validateCode`
  - [ ] Adicionar `@Throttle('medium', '10-5m')` em `resetPassword`

- [ ] **Etapa 4: Testes (1h)**
  - [ ] Criar `test/auth.rate-limit.e2e-spec.ts`
  - [ ] Implementar teste para 5 logins em 1 minuto
  - [ ] Implementar teste para rate limit na 6ª tentativa
  - [ ] Rodar: `npm run test:e2e`
  - [ ] Validar HTTP 429 (Too Many Requests)

- [ ] **Etapa 5: Documentação (30min)**
  - [ ] Adicionar comentários no código
  - [ ] Atualizar swagger docs
  - [ ] Documentar limites em README

**Validação Final:**
- [ ] Teste local passa
- [ ] Rate limit retorna 429
- [ ] Swagger mostra limites
- [ ] Sem bugs em produção

---

### P-02: Auditoria de Eventos
**Prioridade:** 🔴 CRÍTICA | **Impacto:** Alto | **Esforço:** 8h

- [ ] **Etapa 1: Criar Audit Service (2h)**
  - [ ] Criar `src/common/audit/audit.service.ts`
  - [ ] Criar enum `AuditEventType` com 9 tipos
  - [ ] Implementar `log()` com sanitização
  - [ ] Implementar `getAuditLogs()`
  - [ ] Implementar `getFailedLoginAttempts()`
  - [ ] Validar sem erros: `ng build`

- [ ] **Etapa 2: Criar Audit Module (1h)**
  - [ ] Criar `src/common/audit/audit.module.ts`
  - [ ] Criar schema MongoDB com índices
  - [ ] Importar MongooseModule
  - [ ] Exportar AuditService

- [ ] **Etapa 3: Integrar em App Module (1h)**
  - [ ] Importar `AuditModule` em `src/app.module.ts`
  - [ ] Validar build

- [ ] **Etapa 4: Integrar em Use Cases (2h)**
  - [ ] Atualizar `CreateSessionUseCase`
  - [ ] Log LOGIN_SUCCESS
  - [ ] Log LOGIN_FAILURE
  - [ ] Log ACCOUNT_LOCKED
  - [ ] Atualizar `FinishSessionUseCase`
  - [ ] Log TOKEN_REVOKED
  - [ ] Atualizar `ChangePasswordUseCase`
  - [ ] Log PASSWORD_CHANGED
  - [ ] Log PASSWORD_RESET

- [ ] **Etapa 5: Testes (1h)**
  - [ ] Criar `test/auth.audit.e2e-spec.ts`
  - [ ] Testar log de login sucesso
  - [ ] Testar log de falha
  - [ ] Testar log de lock
  - [ ] Validar dados em MongoDB

- [ ] **Etapa 6: Validação (1h)**
  - [ ] Verificar sanitização de email
  - [ ] Verificar ausência de senhas em logs
  - [ ] Verificar timestamps corretos
  - [ ] Validar indices de performance

**Validação Final:**
- [ ] Logs salvos em MongoDB
- [ ] Senhas não aparecem em logs
- [ ] Queries de auditoria rápidas
- [ ] Sem vazamento de informação

---

### P-03: Timing Attack Fix
**Prioridade:** 🔴 CRÍTICA | **Impacto:** Alto | **Esforço:** 2h

- [ ] **Etapa 1: Preparar (30min)**
  - [ ] Entender timing attacks (ler ANALISE_TECNICA_DETALHADA.md)
  - [ ] Preparar dummy hash

- [ ] **Etapa 2: Implementar Fix (1h)**
  - [ ] Abrir `src/modules/auth/application/use-cases/create-session.usecase.ts`
  - [ ] Definir `DUMMY_HASH`
  - [ ] Mover lookup antes da comparação
  - [ ] Usar `userJSON?.password ?? DUMMY_HASH`
  - [ ] Fazer comparação única
  - [ ] Usar resultado combinado para resposta
  - [ ] Validar build

- [ ] **Etapa 3: Testes (30min)**
  - [ ] Criar teste de timing
  - [ ] Medir tempo usuário não existe: ~150-200ms
  - [ ] Medir tempo senha errada: ~150-200ms
  - [ ] Validar diferença < 10ms

**Validação Final:**
- [ ] Timing consistente
- [ ] Sem timing attacks possível
- [ ] Testes passam

---

### P-04: CORS Configuration
**Prioridade:** 🔴 CRÍTICA | **Impacto:** Alto | **Esforço:** 1h

- [ ] **Etapa 1: Preparar Configuração (30min)**
  - [ ] Abrir `src/config/app.config.ts`
  - [ ] Revisar método `configCors()`
  - [ ] Entender whitelist strategy

- [ ] **Etapa 2: Implementar CORS (30min)**
  - [ ] Remover código comentado
  - [ ] Adicionar lógica para production vs dev
  - [ ] Implementar origin callback para logging
  - [ ] Adicionar métodos e headers permitidos
  - [ ] Configurar exposedHeaders
  - [ ] Validar build

- [ ] **Etapa 3: Configurar Variáveis (30min)**
  - [ ] Adicionar `ALLOWED_ORIGINS` em `.env.production`
  - [ ] Adicionar exemplos: `https://frontend.example.com,https://app.example.com`
  - [ ] Validar em `.env.development`
  - [ ] Testar permissividade local

**Validação Final:**
- [ ] CORS headers corretos
- [ ] Production whitelist rigoroso
- [ ] Dev permite todas
- [ ] Sem warnings

---

### P-05: Refresh Token Validation
**Prioridade:** 🔴 CRÍTICA | **Impacto:** Alto | **Esforço:** 2h

- [ ] **Etapa 1: Preparar (30min)**
  - [ ] Entender fluxo de refresh
  - [ ] Revisar `redis-token.repository.ts`
  - [ ] Revisar `get-access-token.usecase.ts`

- [ ] **Etapa 2: Implementar Validação (1h)**
  - [ ] Abrir `GetAccessTokenUseCase`
  - [ ] Adicionar `isRevoked()` check
  - [ ] Validar em Redis
  - [ ] Retornar erro se revogado
  - [ ] Atualizar lastAccess
  - [ ] Log audit do refresh
  - [ ] Validar build

- [ ] **Etapa 3: Testes (30min)**
  - [ ] Criar teste de token revogado
  - [ ] Testar logout + refresh
  - [ ] Validar HTTP 401 após logout
  - [ ] Testar lastAccess atualizado

**Validação Final:**
- [ ] Tokens revogados rejeitados
- [ ] Access atualizado em Redis
- [ ] Audit logged
- [ ] Sem erros

---

## 🟠 FASE 2: MÉDIOS (Estimado: 14 horas)

### P-06: Eliminar Duplicação
**Prioridade:** 🟠 MÉDIA | **Impacto:** Médio | **Esforço:** 4h

- [ ] **Etapa 1: Analisar Duplicação (1h)**
  - [ ] Comparar `auth/config/app.config.ts` com `users/config/app.config.ts`
  - [ ] Listar métodos duplicados
  - [ ] Verificar diferenças

- [ ] **Etapa 2: Criar Pacote Compartilhado (2h)**
  - [ ] Criar `packages/common/`
  - [ ] Criar `packages/common/src/config/app-config.base.ts`
  - [ ] Implementar classe base abstrata
  - [ ] Criar factory de AppConfig

- [ ] **Etapa 3: Migrar Serviços (1h)**
  - [ ] Herdar `AppConfigBase` em Auth
  - [ ] Herdar `AppConfigBase` em Users
  - [ ] Testar ambos os serviços
  - [ ] Validar builds

**Validação Final:**
- [ ] Sem duplicação visível
- [ ] Ambos serviços funcionam
- [ ] Maintainability melhorada

---

### P-07: Error Handling em Async
**Prioridade:** 🟠 MÉDIA | **Impacto:** Médio | **Esforço:** 4h

- [ ] **Etapa 1: Identificar Problemas (1h)**
  - [ ] Abrir `users-queue.service.ts`
  - [ ] Abrir `email-sender.service.ts`
  - [ ] Identificar `emit()` sem catch
  - [ ] Listar todas as operações assíncronas

- [ ] **Etapa 2: Implementar Tratamento (2h)**
  - [ ] Adicionar try-catch
  - [ ] Implementar retry com backoff
  - [ ] Adicionar logging
  - [ ] Tipo FirstValueFrom para RxJS

- [ ] **Etapa 3: Testes (1h)**
  - [ ] Testar falha + retry
  - [ ] Testar sucesso na retry
  - [ ] Testar falha após retries
  - [ ] Validar logs

**Validação Final:**
- [ ] Sem unhandled rejections
- [ ] Retries funcionam
- [ ] Logs completos

---

### P-08: Password Comparison Security
**Prioridade:** 🟠 MÉDIA | **Impacto:** Médio | **Esforço:** 2h

- [ ] **Etapa 1: Analisar (30min)**
  - [ ] Revisar `PasswordVO.comparePassword()`
  - [ ] Revisar uso em use cases
  - [ ] Verificar múltiplas chamadas

- [ ] **Etapa 2: Refatorar (1h)**
  - [ ] Remover `comparePassword()` público de VO
  - [ ] Centralizar em use case
  - [ ] Comparação única
  - [ ] Usar resultado direto

- [ ] **Etapa 3: Testes (30min)**
  - [ ] Validar comportamento
  - [ ] Testar performance
  - [ ] Sem regressions

**Validação Final:**
- [ ] Comparação única e segura
- [ ] Sem chamadas múltiplas
- [ ] Performance OK

---

### P-09: Email VO Validation
**Prioridade:** 🟠 MÉDIA | **Impacto:** Médio | **Esforço:** 3h

- [ ] **Etapa 1: Preparar (30min)**
  - [ ] Revisar RFC 5321
  - [ ] Listar validações faltantes
  - [ ] Coletar lista de domínios descartáveis

- [ ] **Etapa 2: Implementar Validações (1.5h)**
  - [ ] Adicionar `isValid()` estático
  - [ ] Validar comprimento
  - [ ] Validar dots consecutivos
  - [ ] Validar trailing dots
  - [ ] Implementar `isDisposable()`
  - [ ] Adicionar exceção custom

- [ ] **Etapa 3: Testes (1h)**
  - [ ] Testar emails válidos
  - [ ] Testar emails inválidos
  - [ ] Testar disposable domains
  - [ ] Testar edge cases

**Validação Final:**
- [ ] Validações RFC compliant
- [ ] Rejeita disposable emails
- [ ] Testes abrangentes

---

### P-10: User Agent Validation
**Prioridade:** 🟠 MÉDIA | **Impacto:** Médio | **Esforço:** 1h

- [ ] **Etapa 1: Preparar (15min)**
  - [ ] Revisar `RedisTokenRepository`
  - [ ] Entender fluxo de sessão

- [ ] **Etapa 2: Adicionar User Agent (45min)**
  - [ ] Salvar user agent em Redis
  - [ ] Validar em refresh token
  - [ ] Comparar user agents
  - [ ] Rejeitar se diferente
  - [ ] Adicionar validação opcional (flag)

**Validação Final:**
- [ ] User agent salvo
- [ ] Validação funciona
- [ ] Sem false positives

---

## 🟡 FASE 3: BAIXOS (Estimado: 6 horas)

### P-11: Documentação OpenAPI
**Prioridade:** 🟡 BAIXA | **Impacto:** Baixo | **Esforço:** 3h

- [ ] Adicionar decoradores em todos endpoints
- [ ] Documentar request/response
- [ ] Adicionar exemplos
- [ ] Validar Swagger UI

---

### P-12: Constantes Organizadas
**Prioridade:** 🟡 BAIXA | **Impacto:** Baixo | **Esforço:** 1h

- [ ] Consolidar todas as constantes
- [ ] Centralizar em um arquivo
- [ ] Remover duplicação

---

### P-13: Password Policy Enforcement
**Prioridade:** 🟡 BAIXA | **Impacto:** Baixo | **Esforço:** 2h

- [ ] Obrigar senhas fortes em reset
- [ ] Adicionar validações adicionais
- [ ] Testar

---

### P-14: Circuit Breaker
**Prioridade:** 🟡 BAIXA | **Impacto:** Baixo | **Esforço:** 6h

- [ ] Implementar para RabbitMQ
- [ ] Implementar para Email
- [ ] Implementar para Redis
- [ ] Testes de failover

---

## 📊 Progresso Geral

```
FASE 1 (Críticos):     ░░░░░░░░░░░░░░░░░░░░ 0%  (0/17h)
FASE 2 (Médios):       ░░░░░░░░░░░░░░░░░░░░ 0%  (0/14h)
FASE 3 (Baixos):       ░░░░░░░░░░░░░░░░░░░░ 0%  (0/6h)
───────────────────────────────────────────────────
TOTAL:                 ░░░░░░░░░░░░░░░░░░░░ 0%  (0/37h)
```

---

## 📝 Notas e Observações

### Configuração Desenvolvimento
```
NODE_ENV=development
ALLOWED_ORIGINS=*
CORS_ENABLED=true
RATE_LIMIT_ENABLED=true
```

### Configuração Production
```
NODE_ENV=production
ALLOWED_ORIGINS=https://frontend.example.com,https://app.example.com
CORS_ENABLED=true
RATE_LIMIT_ENABLED=true
```

---

## 🎯 Métricas de Sucesso

**Sprint 1 Completa quando:**
- [ ] Todos os 5 críticos implementados
- [ ] Todos os testes passam
- [ ] Nenhum erro em staging
- [ ] Code review aprovado
- [ ] Documentação atualizada
- [ ] Release notes criadas

**Segurança Validada quando:**
- [ ] Teste de timing attack falha (proteção ativa)
- [ ] Rate limit retorna 429
- [ ] CORS rejeita origens inválidas
- [ ] Tokens revogados são rejeitados
- [ ] Audit logs completos

---

## 📞 Support & Questions

**Dúvidas sobre P-01?** → Ver GUIA_IMPLEMENTACAO.md - Seção P-01  
**Dúvidas sobre P-02?** → Ver GUIA_IMPLEMENTACAO.md - Seção P-02  
**Dúvidas técnicas?** → Ver ANALISE_TECNICA_DETALHADA.md  
**ROI e Timeline?** → Ver RESUMO_EXECUTIVO.md

---

## ✨ Template de Status Update

```markdown
## Status Update - [DATA]

### Fase 1: Críticos
- [x] P-01: Rate Limiting - COMPLETO ✅
- [ ] P-02: Auditoria - 50% (4h/8h) 🔄
- [ ] P-03: Timing Attack - TODO ⏳
- [ ] P-04: CORS - TODO ⏳
- [ ] P-05: Refresh Token - TODO ⏳

### Bloqueadores
- Nenhum no momento

### Próximas Ações
1. Continuar P-02
2. Iniciar P-03 em paralelo
3. Testes E2E para P-01

### ETA
- Fase 1 Completa: [DATA]
```

---

**Atualizado:** 13 de Fevereiro de 2026  
**Versão:** 1.0  
**Status:** 🟢 PRONTO PARA INICIAR

