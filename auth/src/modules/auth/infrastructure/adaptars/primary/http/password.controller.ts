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
  HttpOKResponse,
  HttpResponseOutbound,
} from '@auth/domain/ports/primary/http/sucess.port';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { UpdatePasswordUseCase } from '@auth/application/use-cases/update-password-usecase';
import { JWTResetPassGuard } from './guards/jwt-reset-pass.guard';
import { JWTAccessGuard } from './guards/jwt-access.guard';
import { ApiUpdatePassword } from './decorators/docs/api-update-password.decorator';
import { ApiResetPassword } from './decorators/docs/api-reset-password.decorator';
import { ApiValidateCodeForForgotPassword } from './decorators/docs/api-validate-code-for-forgot-password.decorator';
import CookieService from '../../secondary/cookie-service/cookie.service';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { Throttle } from '@nestjs/throttler';

@Controller('auth/pass')
@ApiTags('PasswordController')
export class PasswordController {
  constructor(
    private readonly sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase,
    private readonly validateCodeForForgotPasswordUseCase: ValidateCodeForForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly updatePasswordUseCase: UpdatePasswordUseCase,
    private readonly cookieService: CookieService,
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

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('/validate-code')
  @HttpCode(HttpStatus.OK)
  @ApiValidateCodeForForgotPassword()
  async validateCode(
    @Body() dto: ValidateCodeForForgotPasswordDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<HttpResponseOutbound> {
    const token = await this.validateCodeForForgotPasswordUseCase.execute(
      dto.code,
      dto.email,
    );

    this.cookieService.setCookie(
      Cookies.ResetPassToken,
      token,
      600000,
      response,
    );

    return new HttpOKResponse(
      'Seu código de recuperação de senha foi validado com sucesso.',
    );
  }

  @Patch('/reset')
  @HttpCode(HttpStatus.SEE_OTHER)
  @UseGuards(JWTResetPassGuard)
  @ApiResetPassword()
  async resetPassword(
    @Body() dto: ResetPasswordDTO,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    const { email } = request.user as any;

    await this.resetPasswordUseCase.execute(email, dto.newPassword);
    response.redirect(
      HttpStatus.SEE_OTHER,
      'https://github.com/VitorMendonca62',
    );
  }

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JWTAccessGuard)
  @ApiUpdatePassword()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
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
    return new HttpOKResponse('A senha do usuário foi atualizada!');
  }
}
