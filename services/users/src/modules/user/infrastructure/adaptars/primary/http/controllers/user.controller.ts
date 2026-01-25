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
} from '@modules/user/application/use-cases/user/use-cases';
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
} from '../../common/decorators/docs/user/decorators';
import { UserMapper } from '@user/infrastructure/mappers/user.mapper';
import {
  BusinessRuleFailure,
  FieldAlreadyExists,
  FieldInvalid,
  NotFoundItem,
} from '@user/domain/ports/primary/http/error.port';
import { Cookies } from '@modules/user/domain/enums/cookies.enum';
import CookieService from '../services/cookie/cookie.service';
import { TokenExpirationConstants } from '@modules/user/domain/constants/token-expirations';
import { FastifyReply } from 'fastify';
import { MessageBrokerService } from '@modules/user/domain/ports/secondary/message-broker.port';
import { isUUID } from 'class-validator';
import { ApplicationResultReasons } from '@modules/user/domain/enums/application-result-reasons';

@Controller('users')
export class UserController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly cookieService: CookieService,
    private readonly messageBrokerService: MessageBrokerService,
    private readonly validateEmailUseCase: ValidateEmailUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post('/validate-email')
  // TODO FAZER documentacao
  async sendCode(
    @Body() dto: ValidateEmailDTO,
    @Res() response: FastifyReply,
  ): Promise<void> {
    await this.validateEmailUseCase.sendEmail(dto.email);
    response
      .status(HttpStatus.SEE_OTHER)
      .redirect('https://github.com/VitorMendonca62'); //  OTP code screen
  }

  @Post('/validate-code')
  // TODO FAZER documentacao
  async validateCode(
    @Body() dto: ValidateCodeForValidateEmailDTO,
    @Res({ passthrough: true }) response: FastifyReply,
  ) {
    const useCaseResult = await this.validateEmailUseCase.validateCode(
      dto.code,
      dto.email,
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.BAD_REQUEST);
      return new BusinessRuleFailure(useCaseResult.message);
    }

    const token = useCaseResult.result;

    this.cookieService.setCookie(
      Cookies.SignUpToken,
      token,
      TokenExpirationConstants.SIGN_UP_TOKEN_MS,
      response,
    );

    response
      .status(HttpStatus.SEE_OTHER)
      .redirect('https://github.com/VitorMendonca62'); //  Signup screen
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
    );

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.CONFLICT);
      return new FieldAlreadyExists(
        useCaseResult.message,
        useCaseResult.result,
      );
    }

    this.messageBrokerService.send('user-created', {
      userID,
      email: email,
      password: dto.password,
      phoneNumber: dto.phoneNumber,
      roles: useCaseResult.result.roles,
      createdAt: useCaseResult.result.createdAt,
      updatedAt: useCaseResult.result.updatedAt,
    });

    response.status(HttpStatus.CREATED);
    return new HttpCreatedResponse('Usuário criado com sucesso');
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

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.NOT_FOUND);
      return new NotFoundItem(useCaseResult.message);
    }

    return new HttpOKResponse(
      'Usuário encontrado com sucesso',
      useCaseResult.result,
    );
  }

  @Patch('/')
  @ApiUpdateUser()
  async update(
    @Body() dto: UpdateUserDTO,
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    if (Object.keys(dto).length === 0) {
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

    if (useCaseResult.ok === false) {
      if (
        useCaseResult.reason === ApplicationResultReasons.FIELD_ALREADY_EXISTS
      ) {
        response.status(HttpStatus.CONFLICT);
        return new FieldAlreadyExists(
          useCaseResult.message,
          useCaseResult.result,
        );
      }

      response.status(HttpStatus.NOT_FOUND);
      return new NotFoundItem(useCaseResult.message);
    }

    return new HttpOKResponse('Usuário atualizado com sucesso', dto);
  }

  @Delete('/')
  @ApiDeleteUser()
  async delete(
    @Headers('x-user-id') userID: string,
    @Res({ passthrough: true }) response: FastifyReply,
  ): Promise<HttpResponseOutbound> {
    const useCaseResult = await this.deleteUserUseCase.execute(userID);

    if (useCaseResult.ok === false) {
      response.status(HttpStatus.NOT_FOUND);
      return new NotFoundItem(useCaseResult.message);
    }

    return new HttpOKResponse('Usuário deletado com sucesso');
  }
}
