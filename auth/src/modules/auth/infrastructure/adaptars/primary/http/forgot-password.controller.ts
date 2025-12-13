import {
  HttpCreatedResponse,
  HttpResponseOutbound,
} from '@auth/domain/ports/primary/http/sucess.port';
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('pass')
@ApiTags('pass')
export class AuthController {
  constructor() {}

  @Post('/send-code')
  @HttpCode(HttpStatus.CREATED)
  async login(
    @Body() dto: SendCodeForForgotPasswordDTO,
  ): Promise<HttpResponseOutbound> {
    return new HttpCreatedResponse('Usuário realizou login com sucesso' );
  }
}
