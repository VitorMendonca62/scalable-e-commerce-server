### 👤 Microsserviço Users (Usuários)

#### Requisitos Funcionais (RF)

| ID | Requisito | Descrição Detalhada |
| --- | --- | --- |
| **RF-U01** | **Criação de Usuário (Cadastro)** | Criar um novo registro de usuário comum com dados básicos (nome, e-mail). Deve garantir a **unicidade do e-mail**. |
| **RF-U02** | **Criação de Perfil** | Permitir que o usuário (autenticado via Auth) **complete/edite seu perfil** (ex: data de nascimento, telefone, avatar). |
| **RF-U03** | **Adicionar Endereço** | Permitir que um usuário adicione **múltiplos endereços** de entrega/cobrança, definindo um como principal. |
| **RF-U04** | **Verificação de E-mail** | Registrar se o e-mail do usuário foi verificado. |
| **RF-U05** | **Listar Endereços** | Permitir que o usuário liste todos os seus endereços cadastrados. |
| **RF-U06** | **Deletar Usuário (Conta)** | Permitir que o usuário solicite a **exclusão lógica ou física** da conta. |
| **RF-U07** | **Consulta de Usuário** | Fornecer endpoints para que outros microsserviços consultem informações **públicas ou autorizadas** do usuário. |

#### Requisitos Não Funcionais (RNF)

| ID | Requisito | Descrição Detalhada |
| --- | --- | --- |
| **RNF-U01** | **Consistência de Dados** | Garantir que o e-mail no Users e as credenciais no Auth estejam **consistentes**. |
| **RNF-U02** | **Auditoria** | Registrar quem e quando realizou **alterações críticas** nos dados do usuário. |
| **RNF-U03** | **Segurança no Acesso** | Implementar **autorização baseada em *role*** para garantir acesso seguro aos dados do perfil. |

---

Deseja que eu comece a listar os requisitos para os microsserviços **Produtos** e **Pedidos** agora?
