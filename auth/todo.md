[X] Analisar tipos ( Criar tipos para email, senha e etc)
[x] Criar modulo para message broker
[X] MS-USER que cria usuarios, nao auth
[X] Testes em 100%
[X] Revisar testes
[] Seguir Principios SOLID
[X] Id privado compartilhado entre servicos
[X] Remover dependencia da entidade em DTO
[X] ADicionar objeto de erros em domain
[X] Ver isso:   it('should fail if password is too weak', async () => {
    const dto = plainToInstance(CreateUserDto, {
      password: 'abc', // fraca
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
  });

  [X] Colocar um if para retornar string personalizadas em validators

[X] Criar classes para os VOS, uma pra const, validacao e oturos
[] Criar Controllers de catch
[X] Implementar Guards no controller
[X] Remover o findEmail, findUsername e colocar o findOne
[X] Criar um adpter para senha
[X] Criar um pipe para verificar se refreshToken está válido

[X] usar de testesDTO.md no teste de createDTO:
[] Fazer validacao no ci de cobertura de testes

[X] usar isso: https://www.luiztools.com.br/post/autenticacao-json-web-token-jwt-em-nestjs/
[] Adicionar faker js
[] Adicionar deslogar em todos os dispositivos
[X] Criar um value object para senhas hasheadas
[] Rotacao de refresh token

https://www.reddit.com/r/webdev/comments/1bgs7bi/best_practices_for_forgot_password_flow/?tl=pt-br
https://www.reddit.com/r/brdev/comments/1ik45oi/duvida_sobre_jwt_token_e_refresh_token/
https://www.reddit.com/r/brdev/comments/164yah1/como_vcs_invalidam_um_access_tokenrefresh_token/?chainedPosts=t3_1ik45oi
https://www.descope.com/blog/post/refresh-token-rotation