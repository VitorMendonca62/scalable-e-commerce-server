# Code Review - Users Service

## Visao Geral
O codebase segue uma estrutura inspirada em Clean/Hexagonal Architecture (camadas de domain, application e infrastructure). Ha boas separacoes em ports, use-cases e adaptadores, mas ainda existem acoplamentos diretos do dominio com a infraestrutura, alem de alguns bugs funcionais e fragilidades em fluxos de endereco e atualizacao de usuario.

## 1. SOLID

### SRP (Single Responsibility Principle)
- Os controllers acumulam responsabilidades de orquestracao, mapeamento, integracao com message broker e tratamento de erros HTTP. Isso tende a crescer e ficar dificil de manter. Exemplos em [../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts](../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts#L99-L228).
- O envio de eventos para fila no controller mistura preocupacao de infraestrutura com camada de entrada HTTP. Isso dificulta testes isolados e reuso da logica em outros adaptadores. Ver [../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts](../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts#L120-L131).

### OCP (Open/Closed Principle)
- A validacao de unicidade no update esta hardcoded apenas para username. Qualquer nova regra (ex.: email) exigira alterar o use-case diretamente. Exemplo em [../src/modules/user/application/use-cases/user/update-user.usecase.ts](../src/modules/user/application/use-cases/user/update-user.usecase.ts#L23-L38). Sugestao: extrair uma estrategia de validacao de unicidade ou mover para um service de dominio.

### LSP (Liskov Substitution Principle)
- O contrato do repositorio de enderecos indica `delete(addressIndex: number)` mas o use-case chama com `addresses[addressIndex].id` (um ID persistido). Isso quebra substituibilidade e torna as implementacoes inconsistentes. Referencias em [../src/modules/user/domain/ports/secondary/address-repository.port.ts](../src/modules/user/domain/ports/secondary/address-repository.port.ts#L3-L12) e [../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts](../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts#L13-L24).

### ISP (Interface Segregation Principle)
- Ports do dominio dependem diretamente de modelos de infraestrutura (TypeORM). Isso obriga clientes do dominio a conhecerem detalhes de persistencia. Ver [../src/modules/user/domain/ports/secondary/user-repository.port.ts](../src/modules/user/domain/ports/secondary/user-repository.port.ts#L1-L20) e [../src/modules/user/domain/ports/secondary/address-repository.port.ts](../src/modules/user/domain/ports/secondary/address-repository.port.ts#L1-L12).

### DIP (Dependency Inversion Principle)
- Entidades e ports do dominio importam modelos de infraestrutura, invertendo a dependencia esperada. Isso acopla o dominio a detalhes do ORM. Ver [../src/modules/user/domain/entities/user.entity.ts](../src/modules/user/domain/entities/user.entity.ts#L1-L45) e [../src/modules/user/domain/ports/secondary/user-repository.port.ts](../src/modules/user/domain/ports/secondary/user-repository.port.ts#L1-L20).

## 2. Clean Code

- Ha nomes com typos e inconsistencias que prejudicam leitura e confianca: `addressRepositoy` e `passwordHashser`. Exemplos em [../src/modules/user/application/use-cases/address/add-user-address.usecase.ts](../src/modules/user/application/use-cases/address/add-user-address.usecase.ts#L12-L20) e [../src/modules/user/application/use-cases/user/create-user.usecase.ts](../src/modules/user/application/use-cases/user/create-user.usecase.ts#L18-L22).
- Ha duplicacao de tratamento de erro para `NOT_FOUND` e `CONFLICT` em controllers, o que sugere refatoracao para filtros/interceptors ou helper de resposta. Exemplos em [../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts](../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts#L112-L192).
- Comentarios TODO em endpoints indicam trabalho pendente e potencial lacuna de documentacao. Exemplo em [../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts](../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts#L64-L77).

## 3. Arquitetura e Organizacao

- A estrutura geral (domain, application, infrastructure) e o uso de ports e use-cases sao positivos.
- Ha acoplamento excessivo do dominio com infraestrutura (ORM), reduzindo portabilidade e aumentando custo de evolucao. Exemplos em [../src/modules/user/domain/entities/user.entity.ts](../src/modules/user/domain/entities/user.entity.ts#L1-L45) e [../src/modules/user/domain/ports/secondary/user-repository.port.ts](../src/modules/user/domain/ports/secondary/user-repository.port.ts#L1-L20).
- O modulo faz configuracao de JWT lendo arquivo do filesystem em tempo de bootstrap, o que adiciona dependencia de ambiente em testes e pipelines. Ver [../src/modules/user/user.module.ts](../src/modules/user/user.module.ts#L50-L53).

## 4. Code Smells

- **Bug de inicializacao de entidade**: `UserEntity` sempre inicializa `addresses` com `[]`, ignorando `props.addresses`. Isso impede hidratacao correta de dados persistidos. Ver [../src/modules/user/domain/entities/user.entity.ts](../src/modules/user/domain/entities/user.entity.ts#L43-L44).
- **Indice como ID**: listagem de enderecos expõe `id` como indice do array. Isso quebra quando a ordem muda e conflita com exclusao por ID real. Ver [../src/modules/user/application/use-cases/address/get-user-addresses.usecase.ts](../src/modules/user/application/use-cases/address/get-user-addresses.usecase.ts#L24-L36) e [../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts](../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts#L13-L24).
- **Tratamento generico de erro**: o use-case de adicionar endereco engole erro e retorna mensagem generica, sem log ou contexto. Ver [../src/modules/user/application/use-cases/address/add-user-address.usecase.ts](../src/modules/user/application/use-cases/address/add-user-address.usecase.ts#L32-L43).

## 5. Testabilidade

- O uso de `fs.readFileSync` no modulo cria dependencia direta do filesystem em tests, dificultando testes isolados e in-memory. Ver [../src/modules/user/user.module.ts](../src/modules/user/user.module.ts#L50-L53).
- O `UsersQueueService.send` eh chamado sem `await`, o que dificulta testes que precisam garantir envio de eventos e tratamento de falhas. Ver [../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts](../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts#L120-L131) e [../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts](../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts#L194-L201).
- Geracao de OTP dentro do use-case reduz controle em testes deterministas. Ver [../src/modules/user/application/use-cases/user/validate-email-usecase.ts](../src/modules/user/application/use-cases/user/validate-email-usecase.ts#L25-L45).

## 6. Sugestoes de Melhoria (com exemplos direcionais)

1. **Corrigir hidratacao de entidade**
   - Atual: inicializacao ignora `props.addresses`. Ver [../src/modules/user/domain/entities/user.entity.ts](../src/modules/user/domain/entities/user.entity.ts#L43-L44).
   - Sugestao: `this.addresses = props.addresses ?? [];` e evitar dependencias de infraestrutura dentro do dominio.

2. **Ajustar unicidade no update**
   - Atual: valida username sem excluir o proprio usuario, bloqueando updates idempotentes. Ver [../src/modules/user/application/use-cases/user/update-user.usecase.ts](../src/modules/user/application/use-cases/user/update-user.usecase.ts#L23-L38).
   - Sugestao: incluir `userID` na consulta e ignorar o proprio registro, ou mover validacao para metodo especifico do repositorio.

3. **Rever contrato e identificador de endereco**
   - Atual: `GetUserAddresses` usa indice como ID, e `Delete` aceita ID real via indice. Ver [../src/modules/user/application/use-cases/address/get-user-addresses.usecase.ts](../src/modules/user/application/use-cases/address/get-user-addresses.usecase.ts#L24-L36) e [../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts](../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts#L13-L24).
   - Sugestao: retornar o ID real do endereco e expor delete por `addressId` real. Ajustar port para `delete(addressId: string)`.

4. **Desacoplar dominio de ORM**
   - Atual: entidade e ports usam `UserModel/AddressModel`. Ver [../src/modules/user/domain/entities/user.entity.ts](../src/modules/user/domain/entities/user.entity.ts#L1-L45) e [../src/modules/user/domain/ports/secondary/user-repository.port.ts](../src/modules/user/domain/ports/secondary/user-repository.port.ts#L1-L20).
   - Sugestao: criar types do dominio (ex.: `UserRecord`, `AddressRecord`) e mapear no adapter.

5. **Consistencia no envio de eventos**
   - Atual: envio para fila eh fire-and-forget sem tratamento. Ver [../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts](../src/modules/user/infrastructure/adaptars/primary/http/controllers/user.controller.ts#L120-L131).
   - Sugestao: aguardar `send` e tratar falhas, ou mover para use-case com politica explicita (best effort vs garantia).

## 7. Avaliacao Final

### Resumo Geral
- Boa base arquitetural, mas com violacoes de DIP e alguns bugs funcionais em fluxos criticos. O maior risco vem de inconsistencias entre contratos e implementacoes (enderecos) e da acoplagem do dominio a infraestrutura.

### Lista Priorizada de Melhorias
- **Alto impacto**: corrigir hidratação de `UserEntity`; ajustar fluxo de enderecos (ID real vs indice); corrigir validacao de unicidade no update.
- **Medio impacto**: remover dependencias de infraestrutura no dominio (ports e entidades); padronizar envio de eventos com tratamento de falhas.
- **Baixo impacto**: corrigir typos e reduzir duplicacao em controllers; tratar TODOs de documentacao.

### Principais Riscos Tecnicos
- Exclusao/consulta de enderecos pode deletar ou retornar dados incorretos devido ao uso de indice. Ver [../src/modules/user/application/use-cases/address/get-user-addresses.usecase.ts](../src/modules/user/application/use-cases/address/get-user-addresses.usecase.ts#L24-L36) e [../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts](../src/modules/user/application/use-cases/address/delete-user-address.usecase.ts#L13-L24).
- Dominio acoplado ao ORM dificulta migracoes e evolucoes de persistencia. Ver [../src/modules/user/domain/entities/user.entity.ts](../src/modules/user/domain/entities/user.entity.ts#L1-L45).
- Atualizacao de usuario pode falhar incorretamente quando o username nao muda. Ver [../src/modules/user/application/use-cases/user/update-user.usecase.ts](../src/modules/user/application/use-cases/user/update-user.usecase.ts#L23-L38).
