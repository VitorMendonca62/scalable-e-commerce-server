import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Res,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SendCodeForForgotPasswordDTO } from './dtos/send-code-for-forgot-pass.dto';
import { ApiSendCodeforForgotPassword } from './decorators/docs/api-send-code-for-forgot-password.decorator';
import { Request, Response } from 'express';
import { ValidateCodeForForgotPasswordDTO } from './dtos/validate-code-for-forgot-pass.dto';
import ValidateCodeForForgotPasswordUseCase from '@auth/application/use-cases/validate-code-for-forgot-password.usecase';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import { ResetPasswordUseCase } from '@auth/application/use-cases/reset-password.usecase';
import {
  HttpAcceptedResponse,
  HttpResponseOutbound,
} from '@auth/domain/ports/primary/http/sucess.port';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { UpdatePasswordUseCase } from '@auth/application/use-cases/update-password-usecase';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { JWTResetPassGuard } from './guards/jwt-reset-pass.guard';

@Controller('auth/pass')
@ApiTags('ForgotPasswordController')
export class ForgotPasswordController {
  constructor(
    private readonly sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase,
    private readonly validateCodeForForgotPasswordUseCase: ValidateCodeForForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
  ) {}

  @Post('/send-code')
  @HttpCode(HttpStatus.SEE_OTHER)
  @ApiSendCodeforForgotPassword()
  async sendCode(
    @Body() dto: SendCodeForForgotPasswordDTO,
    @Res() response: Response,
  ): Promise<void> {
    await this.sendCodeForForgotPasswordUseCase.execute(dto.email);
    response.redirect(
      HttpStatus.SEE_OTHER,
      'https://github.com/VitorMendonca62',
    );
  }

  @Post('/validate-code')
  @HttpCode(HttpStatus.CREATED)
  // TODO: Fazer documentacao
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

  @Patch('/reset-pass')
  @HttpCode(HttpStatus.ACCEPTED)
  // TODO: Fazer documentacao
  @UseGuards(JWTResetPassGuard)
  async resetPassword(
    @Body() dto: ResetPasswordDTO,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const { email } = request.user as any;

    await this.resetPasswordUseCase.execute(email, dto.newPassword);
    response.redirect(HttpStatus.SEE_OTHER, '/auth/login');
  }

  @Patch('/')
  @HttpCode(HttpStatus.ACCEPTED)
  // TODO: Fazer documentacao
  @UseGuards(JWTAuthGuard)
  async updatePassword(
    @Body() dto: UpdatePasswordDTO,
    @Req() request: Request,
  ): Promise<HttpResponseOutbound> {
    const { userID } = request.user as any;

    await this.updatePasswordUseCase.execute(
      userID,
      dto.newPassword,
      dto.oldPassword,
    );
    return new HttpAcceptedResponse('A senha do usuário foi atualizada!');
  }
}
