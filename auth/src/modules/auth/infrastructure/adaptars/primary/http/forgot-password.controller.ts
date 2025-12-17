import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import {
  HttpCreatedResponse,
  HttpResponseOutbound,
} from '@auth/domain/ports/primary/http/sucess.port';
import { Controller, Post, HttpCode, HttpStatus, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SendCodeForForgotPasswordDTO } from './dtos/send-code-for-forgot-pass.dto';

@Controller('pass')
@ApiTags('pass')
export class ForgorPasswordController {
  constructor(
    private readonly sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase,
  ) {}

  @Post('/send-code')
  @HttpCode(HttpStatus.CREATED)
  async sendCode(
    @Body() dto: SendCodeForForgotPasswordDTO,
  ): Promise<HttpResponseOutbound> {
    await this.sendCodeForForgotPasswordUseCase.execute(dto.email);
    return new HttpCreatedResponse('Código enviado com sucesso.');
  }
}
