# Análise de Performance — Módulo `auth`

Este relatório analisa o código do módulo `auth` (serviço de autenticação) focando em: complexidade algorítmica, uso de memória, I/O e operações assíncronas, e escalabilidade. As recomendações são práticas e incluem exemplos de refatoração.

🔴 Problemas críticos de performance

- **Uso de APIs síncronas que bloqueiam o event loop:** o `BcryptPasswordHasher` usa `bcrypt.hashSync` e `bcrypt.compareSync`. Chamadas síncronas de bcrypt bloqueiam o event loop e reduzem drasticamente a concorrência do processo Node.
- **I/O e operações de crypto síncronas por requisição:** leituras com `fs.readFileSync` e chamadas a `importSPKI` / `exportJWK` em `GetCertsUseCase` e leituras de chave privada em `JwtTokenService.generateResetPassToken` fazem I/O e operações CPU-bound em cada requisição, causando latência alta e uso de CPU (bloqueante).
- **Operações Redis potencialmente custosas para grandes conjuntos:** `RedisTokenRepository.revokeAllSessions` usa `smembers` seguido de `del(...tokens)`. Para muitos tokens isso pode gerar operação única muito pesada no Redis e em memória do cliente.
- **Uso inseguro/ineficiente de `deleteMany` sem await:** `MongooseEmailCodeRepository.deleteMany` chama `.deleteMany(...).exec()` sem `await` (fire-and-forget), o que pode causar comportamentos inesperados e concorrência não controlada.

🟡 Pontos de melhoria

- **Cachear certs e chaves:** `GetCertsUseCase.getJwk` e `JwtTokenService.generateResetPassToken` leem e parseiam arquivos PEM cada vez. Cache em memória (lazy load ou no bootstrap) reduz CPU e I/O.
- **Trocar bcrypt sync por async:** use `bcrypt.hash` / `bcrypt.compare` (promises) para evitar bloquear o event loop.
- **Usar UNLINK / pipelines no Redis para operações de massa:** `DEL` é bloqueante para chaves grandes; `UNLINK` (Redis >=4) é preferível, ou usar pipelines para deletar em batches.
- **Evitar leituras de arquivos sincronas em código executado sob demanda:** use `fs.promises.readFile` ou injetar as chaves via `ConfigService`/variáveis de ambiente no bootstrap.
- **Paralelizar operações independentes quando seguro:** por exemplo, geração de tokens (CPU) e gravação da sessão (I/O) podem ser iniciadas sem bloqueio do event loop; ainda assim, decidir se é aceitável retornar antes de garantir persistência.

🟢 O que está adequado

- **Uso de abstrações (ports/adapters):** o projeto usa portas e adaptadores (hexagonal), facilitando substituir implementações por versões otimizadas (ex.: implementar versão non-blocking do PasswordHasher, ou um TokenRepository que faça operações em lote).
- **Operações de banco/redis isoladas por responsabilidade:** cada caso de uso chama métodos de repositório bem definidos — facilita introduzir caching/pipelines sem alterar a lógica de negócio.
- **Evita N+1 no código lido:** os use-cases inspecionados fazem consultas diretas `findOne` por id/email; não foi detectado loop que gere N+1 queries no código analisado.

🚀 Sugestões concretas de refatoração (com exemplos de código)

1) Tornar `PasswordHasher` não-bloqueante

Antes (sincrono — bloqueante):

```ts
// bcrypt-password-hasher.ts (atual)
hash(password: string): string {
  return bcrypt.hashSync(password, 10);
}

compare(password: string, hashed: string): boolean {
  return bcrypt.compareSync(password, hashed);
}
```

Depois (assíncrono, baseado em Promise):

```ts
// bcrypt-password-hasher.ts (refatorado)
import { promisify } from 'util';
import * as bcrypt from 'bcryptjs';

export default class BcryptPasswordHasher implements PasswordHasher {
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(password, hashed);
  }
}
```

Obs: atualizar a interface `PasswordHasher` para métodos async e ajustar callsites (usar `await`). Impacto: elimina bloqueios no event loop; com alto QPS, reduz latência e melhora throughput.

2) Cachear e evitar leitura/parse repetido de PEMs

Problema: `GetCertsUseCase.getJwk` faz `fs.readFileSync` + `importSPKI` em cada chamada.

Refatoração (lazy, cache in-memory):

```ts
// get-certs.usecase.ts (refatorado)
import { promises as fs } from 'fs';

class GetCertsUseCase {
  private jwkCache = new Map<string, any>();

  private async getJwk(file: `${string}.pem`) {
    if (this.jwkCache.has(file)) return this.jwkCache.get(file);

    const publicPem = await fs.readFile(
      path.join(process.cwd(), `certs/${file}`),
      'utf-8',
    );
    const publicKey = await importSPKI(publicPem, 'RS256');
    const jwk = await exportJWK(publicKey);
    this.jwkCache.set(file, jwk);
    return jwk;
  }
}
```

Melhor ainda: carregar no bootstrap e injetar via provider (menos trabalho por requisição).

3) Não ler chave privada por requisição no token service

Antes:

```ts
privateKey: fs.readFileSync(path.join(process.cwd(), `certs/reset-pass-private.pem`)),
```

Depois: ler uma vez no bootstrap e injetar via `ConfigService` ou provider. Exemplo (module provider):

```ts
// auth.module.ts
{
  provide: 'RESET_PASS_PRIVATE_KEY',
  useFactory: async () => {
    return await fs.promises.readFile(
      path.join(process.cwd(), 'certs/reset-pass-private.pem'),
    );
  },
}
```

E no `JwtTokenService` usar a chave injetada (evita I/O síncrono e parse repetido).

4) Melhorar `RedisTokenRepository.revokeAllSessions`

Problema: `smembers` + `del(...tokens)` pode enviar milhares de args ao `DEL` ou bloquear Redis.

Opções:
- Usar `UNLINK` ao invés de `DEL` se suportado (desassocia chaves imediatamente, remoção em background).
- Deletar em batches via pipeline para evitar grandes payloads.

Exemplo (batch pipeline):

```ts
async revokeAllSessions(userID: string): Promise<void> {
  const sessionsKey = `session:${userID}`;
  const tokens = await this.redis.smembers(sessionsKey);
  if (!tokens || tokens.length === 0) return;

  const batchSize = 500;
  for (let i = 0; i < tokens.length; i += batchSize) {
    const slice = tokens.slice(i, i + batchSize);
    const pipeline = this.redis.pipeline();
    pipeline.del(...slice);
    await pipeline.exec();
  }
  await this.redis.del(sessionsKey);
}
```

5) Corrigir `deleteMany` fire-and-forget

Atualmente `MongooseEmailCodeRepository.deleteMany` não `await` a operação. Sempre `await` a promessa ou lidar explicitamente com erros.

```ts
async deleteMany(email: string): Promise<void> {
  await this.EmailCodeModel.deleteMany({ email }).exec();
}
```

6) Paralelizar quando possível (promises em paralelo)

No `CreateSessionUseCase.generateAccessAndRefreshToken`, a geração de tokens é CPU-bound (assinatura JWT) e a persistência é I/O. Se aceitável, você pode gerar tokens e realizar a gravação de sessão em paralelo, por exemplo:

```ts
const accessToken = this.tokenService.generateAccessToken(...);
const { refreshToken, tokenID } = this.tokenService.generateRefreshToken(...);

// iniciar gravação sem alterar garantia (avaliar risco)
await this.tokenRepository.saveSession(tokenID, user.userID, ip, userAgent);
```

📈 Impacto estimado das melhorias

- Migrar bcrypt para async: reduz bloqueio do event loop, podendo aumentar o throughput do processo em 2–10x sob alta concorrência (dependendo do número de CPUs e QPS). Latência por requisição pode diminuir drasticamente quando muitas requisições fazem hashing/compare.
- Cache de certs / chaves: evita operações de I/O e parsing por requisição; economiza dezenas a centenas de milissegundos por requisição (dependendo do custo de importSPKI/exportJWK), e reduz uso de CPU.
- Evitar fs.readFileSync em geração de JWT: reduz latência de geração de tokens (tipicamente 5–50ms por leitura/parse dependendo do sistema) e evita bloqueios imprevisíveis.
- Uso de pipelines/UNLINK no Redis: reduz janela de bloqueio no Redis e evita picos de latência quando um usuário remove muitas sessões.
- Corrigir operações não-await (`deleteMany`): melhora correção e previsibilidade; evita vazamentos de trabalho assíncrono e possíveis condições de corrida.

Conclusão rápida: o design e as abstrações do código facilitam otimizações pontuais. As mudanças de maior impacto são a remoção de chamadas síncronas que bloqueiam o event loop (bcrypt e fs.readFileSync) e o cache das operações pesadas de crypto (certs/chaves). Implementando essas mudanças, espera-se melhora significativa no throughput e na latência sob carga.

---
Arquivo gerado automaticamente para referência e ação: `performance_analysis_auth.md`
