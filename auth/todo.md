[X] Analisar tipos ( Criar tipos para email, senha e etc)
[x] Criar modulo para message broker
[] MS-USER que cria usuarios, nao auth
[] Testes em 100%
[] Revisar testes
[] Seguir Principios SOLID
[] Id privado compartilhado entre servicos
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
[] Implementar Guards no controller
[X] Remover o findEmail, findUsername e colocar o findOne
[] Criar um adpter para senha
[] Criar um pipe para verificar se refreshToken está válido

[] usar de testesDTO.md no teste de createDTO:

[] Adicionar jest.enableAutomock(); em todos os testes unitarios