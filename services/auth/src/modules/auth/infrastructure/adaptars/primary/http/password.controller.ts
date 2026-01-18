import SendCodeForForgotPasswordUseCase from '@auth/application/use-cases/send-code-for-forgot-password.usecase';
import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Body,
  Res,
  Patch,
  Headers,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SendCodeForForgotPasswordDTO } from './dtos/send-code-for-forgot-pass.dto';
import { ApiSendCodeforForgotPassword } from './decorators/docs/api-send-code-for-forgot-password.decorator';
import { ValidateCodeForForgotPasswordDTO } from './dtos/validate-code-for-forgot-pass.dto';
import ValidateCodeForForgotPasswordUseCase from '@auth/application/use-cases/validate-code-for-forgot-password.usecase';
import { ResetPasswordDTO } from './dtos/reset-password.dto';
import {
  HttpOKResponse,
  HttpResponseOutbound,
} from '@auth/domain/ports/primary/http/sucess.port';
import { UpdatePasswordDTO } from './dtos/update-password.dto';
import { ChangePasswordUseCase } from '@auth/application/use-cases/change-password.usecase';
import { ApiUpdatePassword } from './decorators/docs/api-update-password.decorator';
import { ApiResetPassword } from './decorators/docs/api-reset-password.decorator';
import { ApiValidateCodeForForgotPassword } from './decorators/docs/api-validate-code-for-forgot-password.decorator';
import CookieService from '../../secondary/cookie-service/cookie.service';
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { TokenExpirationConstants } from '@auth/domain/constants/token-expirations';
import { FastifyReply } from 'fastify';

@Controller('/pass')
@ApiTags('PasswordController')
export class PasswordController {
  constructor(
    private readonly sendCodeForForgotPasswordUseCase: SendCodeForForgotPasswordUseCase,
    private readonly validateCodeForForgotPasswordUseCase: ValidateCodeForForgotPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly cookieService: CookieService,
  ) {}

  @Post('/send-code')
  @ApiSendCodeforForgotPassword()
  async sendCode(
    @Body() dto: SendCodeForForgotPasswordDTO,
    @Res() response: FastifyReply,
  ): Promise<void> {
    await this.sendCodeForForgotPasswordUseCase.execute(dto.email);
    response
      .status(HttpStatus.SEE_OTHER)
      .redirect('https://github.com/VitorMendonca62'); //  OTP code screen
  }

  @Post('/validate-code')
  @HttpCode(HttpStatus.OK)
  @ApiValidateCodeForForgotPassword()
  async validateCode(
    @Body() dto: ValidateCodeForForgotPasswordDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const token = await this.validateCodeForForgotPasswordUseCase.execute(
      dto.code,
      dto.email,
    );

    this.cookieService.setCookie(
      Cookies.ResetPassToken,
      token,
      TokenExpirationConstants.RESET_PASS_TOKEN_MS,
      response,
    );
    return new HttpOKResponse(
      'Seu código de recuperação de senha foi validado com sucesso.',
    );
  }

  @Patch('/reset')
  @ApiResetPassword()
  async resetPassword(
    @Body() dto: ResetPasswordDTO,
    @Res() response: FastifyReply,
    @Headers('x-user-email') email: string,
  ): Promise<void> {
    await this.changePasswordUseCase.executeReset(email, dto.newPassword);
    response
      .status(HttpStatus.SEE_OTHER)
      .redirect('https://github.com/VitorMendonca62'); // Login
  }

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  @ApiUpdatePassword()
  async updatePassword(
    @Body() dto: UpdatePasswordDTO,
    @Headers('x-user-id') userID: string,
  ): Promise<HttpResponseOutbound> {
    await this.changePasswordUseCase.executeUpdate(
      userID,
      dto.newPassword,
      dto.oldPassword,
    );
    return new HttpOKResponse('A senha do usuário foi atualizada!');
  }
}
