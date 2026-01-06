## Requisitos Funcionais de Autenticação (Módulo Auth)

| ID Requisito | Descrição Detalhada |
| :--- | :--- |
| **RF-A01** | **Login com Credenciais:** Permitir que um usuário faça login usando e-mail e senha validados. |
| **RF-A02** | **Login Social (Google):** Suportar o fluxo de autenticação via OAuth/OIDC com o Google. |
| **RF-A03** | **Emissão de Token JWT:** Após login bem-sucedido, emitir um JSON Web Token (JWT) de acesso (curta duração) e um token de refresh (longa duração). |
| **RF-A04** | **Renovação de Token:** Fornecer um endpoint para receber o token de refresh e emitir um novo token de acesso válido. |
| **RF-A05** | **Esqueci a Senha - Solicitação:** Permitir que o usuário solicite a redefinição de senha, gerando um código único ou link de redefinição (token) e enviando-o por e-mail. |
| **RF-A06** | **Esqueci a Senha - Validação:** Permitir que o usuário utilize o código/token recebido por e-mail para redefinir a senha. |
| **RF-A07** | **Validação de Token:** Fornecer um mecanismo (endpoint ou chave pública) para que outros microsserviços (Users, Products, etc.) possam validar a autenticidade e as permissões (roles) de um token JWT. |
| **RF-A08** | **Logout:** Invalidar os tokens de sessão (ex: colocando o token de refresh em uma blacklist). |

##  Requisitos Não-Funcionais de Autenticação (Módulo Auth)

| ID Requisito | Descrição Detalhada|
| :---- | :---- |
| **RNF-A01**  | **Segurança de Senhas:** Armazenar senhas utilizando hashing robusto (ex: bcrypt, Argon2) com salt (sal) aleatório e único.|
| **RNF-A02**  | **Limitação de Tentativas (Rate Limiting):** Implementar limitação de taxa (por IP ou e-mail) nos endpoints de login para mitigar ataques de força bruta. |
| **RNF-A03**  | **Transporte Seguro:** Todas as comunicações de autenticação devem ocorrer através de **HTTPS/TLS**.|
| **RNF-A04**  | **Disponibilidade:** O serviço Auth deve ter **alta disponibilidade**, sendo tolerante a falhas (ex: implantação em múltiplos AZs).|
| **RNF-A05**  | **Logging e Auditoria:** Registrar eventos relevantes de autenticação (login bem-sucedido, falha de login, bloqueio por rate limiting, criação e revogação de tokens, alterações de credenciais), incluindo timestamp, identificador do usuário (quando aplicável), IP e contexto da requisição. Os logs não devem conter dados sensíveis (ex: senhas ou tokens em claro) e devem permitir integração com ferramentas de monitoramento e auditoria. |
