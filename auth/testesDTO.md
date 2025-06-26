
    it('should throw bad request error when any required field is undefined', async () => {
      const requiredFields = ['username', 'email', 'name', 'passoword', 'phonenumber']
      const httpServer = app.getHttpServer();
      const requestForController =  await request(app.getHttpServer())
        .post('/auth/register')

      requiredFields.forEach((field) => {
        const dto = mockCreateUserDTO();
        dto[field] = undefined;

        const response =
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toEqual(
        {
        statusCode: HttpStatus.CREATED,
        message: 'Usuário criado com sucesso',
      }
        new FieldInvalid(UsernameConstants.ERROR_REQUIRED, 'username'),
      );
      })

      
    });

    it('should throw bad request error when email is invalid', async () => {
      const dto = mockCreateUserDTO({
        email: EmailConstants.WRONG_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toEqual(
        new FieldInvalid(EmailConstants.ERROR_INVALID, 'email'),
      );
    });

    it('should throw bad request error when password is weak', async () => {
      const dto = mockCreateUserDTO({
        password: PasswordConstants.WEAK_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toEqual(
        new FieldInvalid(PasswordConstants.ERROR_WEAK_PASSWORD, 'password'),
      );
    });

    it('should throw bad request error when username is shorter than the allowed length', async () => {
      const dto = mockCreateUserDTO({
        username: UsernameConstants.MIN_LENGTH_EXEMPLE,
      });

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(dto)
        .expect(400);

      expect(response.body).toEqual(
        new FieldInvalid(
          UsernameConstants.ERROR_MIN_LENGTH,
          'username',
        ).getResponse(),
      );
    });