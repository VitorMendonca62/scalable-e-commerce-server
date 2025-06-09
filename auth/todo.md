[X] Analisar tipos ( Criar tipos para email, senha e etc)
[x] Criar modulo para message broker
[] MS-USER que cria usuarios, nao auth
[] Testes em 100%
[] Revisar testes
[] Seguir Principios SOLID
[] Id privado compartilhado entre servicos
[X] Remover dependencia da entidade em DTO
[X] ADicionar objeto de erros em domain
[] Ver isso:   it('should fail if password is too weak', async () => {
    const dto = plainToInstance(CreateUserDto, {
      password: 'abc', // fraca
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isStrongPassword');
  });

  [] Colocar um if para retornar string personalizadas: // Na validacao     return (
      isNotEmpty(value) &&
      isString(value) &&
      value.length >= this.MIN_LENGTH &&
      isStrongPasswordValid
    );
  }

[] Criar classes para os VOS, uma pra const, validacao e oturos
[] Criar Controllers de catch