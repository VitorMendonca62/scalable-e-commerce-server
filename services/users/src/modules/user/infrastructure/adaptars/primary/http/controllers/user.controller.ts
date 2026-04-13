import { v7 } from 'uuid';
import {
  Controller,
  Headers,
  Body,
  Post,
  HttpStatus,
  Get,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import {
  HttpCreatedResponse,
  HttpOKResponse,
  HttpResponseOutbound,
} from '@user/domain/ports/primary/http/sucess.port';
import {
  CreateUserUseCase,
  DeleteUserUseCase,
  GetUserUseCase,
  UpdateUserUseCase,
  ValidateEmailUseCase,
} from '@user/application/use-cases/user/use-cases';
import {
  CreateUserDTO,
  UpdateUserDTO,
  ValidateCodeForValidateEmailDTO,
  ValidateEmailDTO,
} from '../dtos/user/dtos';
import {
  ApiCreateUser,
  ApiDeleteUser,
  ApiFindOneUser,
  ApiUpdateUser,
  ApiValidateCode,
  ApiValidateEmail,
} from '../../common/decorators/docs/user/decorators';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import { FieldInvalid } from '@user/domain/ports/primary/http/error.port';
import { Cookies } from '@user/domain/enums/cookies.enum';
import { FastifyReply } from 'fastify';
import { isUUID } from 'class-validator';
import QueueService from '../../../secondary/message-broker/queue.service';
import UseCaseResultToHttpMapper from '@user/infrastructure/mappers/use-case-result-to-http.mapper';

@Controller('users')
export class UserController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly queueService: QueueService,
    private readonly useCaseResultToHttpMapper: UseCaseResultToHttpMapper,
    private readonly validateEmailUseCase: ValidateEmailUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post('/validate-email')
  @ApiValidateEmail()
  async sendCode(
    @Body() dto: ValidateEmailDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.validateEmailUseCase.sendEmail(dto.email);

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse('Código enviado com sucesso para seu email.'),
      response,
    );
  }

  @Post('/validate-code')
  @ApiValidateCode()
  async validateCode(
    @Body() dto: ValidateCodeForValidateEmailDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.validateEmailUseCase.validateCode(
      dto.code,
      dto.email,
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse('Código validado com sucesso.', {
        [Cookies.SignUpToken]: useCaseResult.ok ? useCaseResult.result : null,
      }),
      response,
    );
  }

  @Post('/')
  @ApiCreateUser()
  async create(
    @Body() dto: CreateUserDTO,
    @Headers('x-user-email') email: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const userID = v7();
    const useCaseResult = await this.createUserUseCase.execute(
      this.userMapper.createDTOForEntity(dto, email, userID),
      dto.password,
    );

    if (useCaseResult.ok) {
      await this.queueService.sendUserCreated({
        userID,
        email: email,
        password: useCaseResult.result.password,
        roles: useCaseResult.result.roles,
        createdAt: useCaseResult.result.createdAt,
        updatedAt: useCaseResult.result.updatedAt,
      });
    }

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpCreatedResponse('Usuário criado com sucesso'),
      response,
    );
  }

  @Get('/:identifier')
  @ApiFindOneUser()
  async findOne(
    @Param('identifier') identifier: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.getUserUseCase.execute(
      identifier,
      isUUID(identifier) ? 'userID' : 'username',
    );

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse(
        'Usuário encontrado com sucesso',
        useCaseResult.ok ? useCaseResult.result : null,
      ),
      response,
    );
  }

  @Patch('/')
  @ApiUpdateUser()
  async update(
    @Body() dto: UpdateUserDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    if (Object.keys(dto ?? {}).length === 0) {
      response.status(HttpStatus.BAD_REQUEST);
      return new FieldInvalid(
        'Adicione algum campo para o usuário ser atualizado',
        'all',
      );
    }

    const useCaseResult = await this.updateUserUseCase.execute(
      userID,
      this.userMapper.updateDTOForModel(dto, userID),
    );

    if (useCaseResult.ok) {
      await this.queueService.sendUserUpdated(userID, dto);
    }

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse(
        'Usuário atualizado com sucesso',
        useCaseResult.ok ? dto : null,
      ),
      response,
    );
  }

  @Delete('/')
  @ApiDeleteUser()
  async delete(
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.deleteUserUseCase.execute(userID);

    if (useCaseResult.ok) {
      await this.queueService.sendUserDeleted(userID);
    }

    return this.useCaseResultToHttpMapper.map(
      useCaseResult,
      new HttpOKResponse('Usuário deletado com sucesso'),
      response,
    );
  }
}
