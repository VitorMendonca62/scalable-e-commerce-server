import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import {
  HttpCreatedResponse,
  HttpResponseOutbound,
} from '@auth/domain/ports/primary/http/sucess.port';
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('pass')
@ApiTags('pass')
export class ForgorPasswordController {
  constructor(
    private readonly sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase,
  ) {}

  @Post('/send-code')
  @HttpCode(HttpStatus.CREATED)
  async sendCode(
    @Body() dto: { email: string },
  ): Promise<HttpResponseOutbound> {
    this.sendCodeForForgotPasswordUseCase.execute(dto.email);
    return new HttpCreatedResponse('Usuário realizou login com sucesso');
  }
}
