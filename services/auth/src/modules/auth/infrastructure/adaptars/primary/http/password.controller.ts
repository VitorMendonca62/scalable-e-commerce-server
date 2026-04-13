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
import { Cookies } from '@auth/domain/enums/cookies.enum';
import { FastifyReply } from 'fastify';
import ForgotPasswordUseCase from '@auth/application/use-cases/forgot-password.usecase';
import UseCaseResultToHttpMapper from '@auth/infrastructure/mappers/use-case-result-to-http.mapper';

@Controller('/pass')
@ApiTags('PasswordController')
export class PasswordController {
  constructor(
    private readonly useCaseResultToHttpMapper: UseCaseResultToHttpMapper,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
  ) {}

  @Post('/send-code')
  @HttpCode(HttpStatus.OK)
  @ApiSendCodeforForgotPassword()
  async sendCode(
    @Body() dto: SendCodeForForgotPasswordDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.forgotPasswordUseCase.sendCode(dto.email);

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse(
        'Código de recuperação enviado com sucesso. Verifique seu email.',
      ),
      response,
    );
  }

  @Post('/validate-code')
  @HttpCode(HttpStatus.OK)
  @ApiValidateCodeForForgotPassword()
  async validateCode(
    @Body() dto: ValidateCodeForForgotPasswordDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.forgotPasswordUseCase.validateCode(
      dto.code,
      dto.email,
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse(
        'Seu código de recuperação de senha foi validado com sucesso.',
        {
          [Cookies.ResetPassToken]: useCaseResult.ok
            ? useCaseResult.result
            : null,
        },
      ),
      response,
    );
  }

  @Patch('/reset')
  @ApiResetPassword()
  async resetPassword(
    @Body() dto: ResetPasswordDTO,
    @Res({ passthrough: true }) response: FastifyReply,
    @Headers('x-user-email') email: string,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.changePasswordUseCase.executeReset(
      email,
      dto.newPassword,
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse('Senha atualizada com sucesso'),
      response,
    );
  }

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  @ApiUpdatePassword()
  async updatePassword(
    @Body() dto: UpdatePasswordDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.changePasswordUseCase.executeUpdate(
      userID,
      dto.newPassword,
      dto.oldPassword,
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse('A senha do usuário foi atualizada!'),
      response,
    );
  }
}
