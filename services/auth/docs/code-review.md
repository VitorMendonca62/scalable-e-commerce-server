# Revisao critica do codebase (Auth Service)

Escopo: arquivos de controller, use cases e mappers principais do modulo de auth. Foco em SOLID, Clean Code, arquitetura, code smells, testabilidade e melhorias acionaveis.

## 1) SOLID

### SRP (Single Responsibility)
- O controller concentra responsabilidades de orquestracao de caso de uso, adaptacao de DTOs, gestao de cookies e disparo de mensagem em fila. Isso aumenta acoplamento e dificulta reuso/teste. Exemplo em [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L64-L152).
- O metodo `googleAuthRedirect` mistura regras de negocio (criar/atualizar usuario), integracao com broker e detalhes HTTP. Impacto: mudancas em qualquer dessas areas impactam a mesma unidade, gerando regressao facil.

### OCP (Open/Closed)
- A logica de providers no `executeWithGoogle` eh codificada com `AccountsProvider.DEFAULT/GOOGLE`, exigindo alteracoes internas para adicionar um novo provider. Veja [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L64-L85). Impacto: baixa extensibilidade e risco de regressao ao adicionar novos flows.

### LSP (Liskov Substitution)
- Nao encontrei violacoes claras de LSP nos trechos revisados. O uso de portas e interfaces parece consistente.

### ISP (Interface Segregation)
- As portas parecem pequenas e focadas. Nao ha evidencias claras de interfaces "gordas" nos arquivos revisados. Ponto positivo.

### DIP (Dependency Inversion)
- O caso de uso `CreateSessionUseCase` depende diretamente de `UserModel` (infra) ao tipar o parametro de `generateAccessAndRefreshToken`. Isso acopla a camada de aplicacao a detalhes de infraestrutura. Veja [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L9-L105). Impacto: dificulta troca de persistencia e encarece testes isolados.

## 2) Clean Code

- Nomes: em geral sao claros, mas ha nomes inconsistentes como `userJSON` para um objeto de repositorio, e `OTPCode` em maiusculas para variavel local. Veja [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L29-L36) e [src/modules/auth/application/use-cases/forgot-password.usecase.ts](src/modules/auth/application/use-cases/forgot-password.usecase.ts#L25-L41).
- Funcoes/metodos: `googleAuthRedirect` eh longo e faz muitas coisas. [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L64-L116).
- DRY: repeticao de logica de cookies e respostas nos endpoints `login` e `googleAuthRedirect` e `getAccessToken`. [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L101-L181).
- Comentarios: nao vi excesso de comentarios. O codigo em geral eh legivel, mas a complexidade escondida esta na orquestracao do controller e no fluxo do `executeWithGoogle`.

## 3) Arquitetura e organizacao

- A estrutura em camadas (domain/application/infrastructure) eh clara, mas a fronteira entre aplicacao e infraestrutura esta vazando via `UserModel` dentro do use case. [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L9-L105).
- Existe acoplamento do controller com infraestrutura de mensageria (`UsersQueueService`) dentro do fluxo HTTP. [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L85-L98).
- O mapper usa `UserModel` e DTOs de microservicos no mesmo lugar, o que mistura contextos e tende a crescer. [src/modules/auth/infrastructure/mappers/user.mapper.ts](src/modules/auth/infrastructure/mappers/user.mapper.ts#L49-L89).

## 4) Code Smells

- Metodo longo com multiplas responsabilidades: `googleAuthRedirect`. [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L64-L116).
- Condicional fragil no fluxo Google: depende de `newUserModel` indefinido e de `userModel` sempre valido. O tipo nao explicita `undefined`. [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L71-L85).
- Valores de seguranca hardcoded: hash dummy fixo embutido no codigo. [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L124-L126).
- Repeticao de mensagem de erro na validacao de codigo no fluxo de forgot password. [src/modules/auth/application/use-cases/forgot-password.usecase.ts](src/modules/auth/application/use-cases/forgot-password.usecase.ts#L57-L72).

## 5) Testabilidade

- `CreateSessionUseCase` cria UUID diretamente (`v7()`), o que dificulta testes deterministas. [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L72-L76).
- `ForgotPasswordUseCase` depende de `otpGenerator` e `Date` diretamente, gerando resultados nao deterministas. [src/modules/auth/application/use-cases/forgot-password.usecase.ts](src/modules/auth/application/use-cases/forgot-password.usecase.ts#L25-L50).
- O controller chama diretamente `UsersQueueService`, o que obriga mockar um adapter de mensageria em testes de controller. [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L85-L98).

## 6) Sugestoes de melhoria (acionaveis)

### 6.1 Extrair um serviço de sessao para DRY e SRP
- Extrair a logica de setar cookies e montar resposta para um pequeno serviço/presenter (infra ou application). Isso reduz duplicacao e deixa o controller mais fino.

Exemplo (ideia):
```ts
class SessionPresenter {
  constructor(private readonly cookieService: CookieService) {}

  setTokens(response: FastifyReply, tokens: { accessToken: string; refreshToken: string }) {
    this.cookieService.setCookie(Cookies.RefreshToken, tokens.refreshToken, TokenExpirationConstants.REFRESH_TOKEN_MS, response);
    this.cookieService.setCookie(Cookies.AccessToken, tokens.accessToken, TokenExpirationConstants.ACCESS_TOKEN_MS, response);
  }
}
```

### 6.2 Inverter dependencia do modelo de persistencia no use case
- Mudar `generateAccessAndRefreshToken` para receber um DTO/entidade de dominio em vez de `UserModel`. Isso elimina acoplamento com infra.
- Ex: criar um tipo `AuthUser` no dominio e mapear no repositorio.

### 6.3 Tornar o fluxo de providers extensivel (OCP)
- Aplicar Strategy: uma interface `ProviderSessionStrategy` com implementacoes para `GOOGLE`, `DEFAULT`, etc. O use case orquestra a estrategia sem condicional crescente.

### 6.4 Melhorar determinismo em testes
- Injetar `Clock` e `IdGenerator` (interfaces simples) para substituir `Date` e `v7()` em testes. Isso reduz mocks globais e melhora previsibilidade.

### 6.5 Centralizar mensagens e erros
- Extrair mensagens repetidas (ex: forgot-password) para constantes ou helper, reduzindo DRY e melhorando consistencia. [src/modules/auth/application/use-cases/forgot-password.usecase.ts](src/modules/auth/application/use-cases/forgot-password.usecase.ts#L57-L72).

## 7) Avaliacao final

### Resumo geral
- Boa base arquitetural com camadas claras, mas ha vazamento entre aplicacao e infraestrutura, e controllers fazem trabalho demais. A manutencao vai ficar cara conforme novos providers, integracoes e regras surgirem.

### Melhorias priorizadas

**Alto impacto**
- Remover dependencia direta de `UserModel` no use case (DIP). [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L9-L105).
- Extrair responsabilidade do controller (mensageria + cookies + orquestracao) para servicos dedicados. [src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts](src/modules/auth/infrastructure/adaptars/primary/http/auth.controller.ts#L64-L152).

**Medio impacto**
- Tornar fluxo de providers extensivel (Strategy). [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L64-L85).
- Eliminar valores hardcoded sensiveis e mover para configuracao. [src/modules/auth/application/use-cases/create-session.usecase.ts](src/modules/auth/application/use-cases/create-session.usecase.ts#L124-L126).

**Baixo impacto**
- Padronizar nomes e pequenas duplicacoes. [src/modules/auth/application/use-cases/forgot-password.usecase.ts](src/modules/auth/application/use-cases/forgot-password.usecase.ts#L57-L72).

### Principais riscos tecnicos
- Crescimento de complexidade no controller com novos providers e integrações.
- Dificuldade para substituir persistencia ou testar use cases isoladamente devido a dependencias de infra.
- Regressao silenciosa ao adicionar novos fluxos de login sem uma estrategia extensivel.
