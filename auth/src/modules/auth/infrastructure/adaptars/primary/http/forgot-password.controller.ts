import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SendCodeForForgotPasswordDTO } from './dtos/send-code-for-forgot-pass.dto';
import { ApiSendCodeforForgotPassword } from './decorators/docs/api-send-code-for-forgot-password.decorator';
import { Response } from 'express';
import { ValidateCodeForForgotPasswordDTO } from './dtos/validate-code-for-forgot-pass.dto';
import ValidateCodeForForgotPasswordUseCase from '@auth/application/use-cases/validate-code-for-forgot-password.usecase';

@Controller('pass')
@ApiTags('ForgotPasswordController')
export class ForgotPasswordController {
  constructor(
    private readonly sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase,
    private readonly validateCodeForForgotPasswordUseCase: ValidateCodeForForgotPasswordUseCase,
  ) {}

  @Post('/send-code')
  @HttpCode(HttpStatus.SEE_OTHER)
  @ApiSendCodeforForgotPassword()
  async sendCode(
    @Body() dto: SendCodeForForgotPasswordDTO,
    @Res() response: Response,
  ): Promise<void> {
    await this.sendCodeForForgotPasswordUseCase.execute(dto.email);
    response.redirect(HttpStatus.SEE_OTHER, '/auth/confirm-code');
  }

  @Post('/validate-code')
  @HttpCode(HttpStatus.CREATED)
  async validateCode(
    @Body() dto: ValidateCodeForForgotPasswordDTO,
    @Res() response: Response,
  ): Promise<void> {
    const token = await this.validateCodeForForgotPasswordUseCase.execute(
      dto.code,
      dto.email,
    );
    response.cookie('reset_token', token, {
      httpOnly: true,
      maxAge: 600000,
      path: '/',
    });
    response.redirect(HttpStatus.SEE_OTHER, '/auth/restore-password');
  }
}
