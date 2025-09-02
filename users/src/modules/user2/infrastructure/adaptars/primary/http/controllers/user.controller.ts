import { CreateUserUseCase } from '@modules/user2/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '@modules/user2/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from '@modules/user2/application/use-cases/get-user.usecase';
import { UpdateUserUseCase } from '@modules/user2/application/use-cases/update-user.usecase';
import { UserMapper } from '@modules/user2/infrastructure/mappers/user.mapper';
import {
  Controller,
  UsePipes,
  ValidationPipe,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { ApiCreateUser } from '../../common/decorators/docs/api-create-user.decorator';
import {
  HttpCreatedResponse,
  HttpDeletedResponse,
  HttpOKResponse,
  HttpResponseOutbound,
  HttpUpdatedResponse,
} from '@modules/user2/domain/ports/primary/http/sucess.port';
import { ApiFindOneUser } from '../../common/decorators/docs/api-find-one-user.decorator';
import {
  FieldInvalid,
  NotFoundItem,
} from '@modules/user2/domain/ports/primary/http/error.port';
import { IDValidator } from '@modules/user2/domain/values-objects/uuid/id-validator';
import { ApiUpdateUser } from '../../common/decorators/docs/api-update-user.decorator';
import { UsernameValidator } from '@modules/user2/domain/values-objects/user/username/username-validator';
import { UserEntity } from '../../../secondary/database/entities/user.entity';
import { UpdateUserDTO } from '../dtos/update-user.dto';
import { ApiDeleteUser } from '../../common/decorators/docs/api-delete-user.decorator';
import { AuthorizationToken } from '../getValue/authorization-token.decorator';
import { IdInTokenPipe } from '@common/pipes/id-in-token.pipe';

@Controller('users')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class UserController {
  constructor(
    // private readonly usersQueueService: UsersQueueService,
    private readonly userMapper: UserMapper,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiCreateUser()
  async create(@Body() dto: CreateUserDTO): Promise<HttpResponseOutbound> {
    const user = this.userMapper.createDTOForEntity(dto);

    await this.createUserUseCase.execute(user);
    // TODO COnsertar isso aqui
    // this.usersQueueService.send('user-created', {
    //   id: userId,
    //   email: dto.email,
    //   password: dto.password,
    //   roles: defaultRoles,
    //   email_verified: false,
    //   phone_verified: false,
    // });

    return new HttpCreatedResponse('Usuário criado com sucesso');
  }

  // TODO verificar para que exatamente vai servir isso, seria mais facil criar um /me no qual ele pega do token
  // TODO talvez ele nao vai precisar visitar outros usuarios, ou sim, nao sei
  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiFindOneUser()
  async findOne(
    @Query('id') id?: string,
    @Query('username') username?: string,
  ): Promise<HttpResponseOutbound> {
    let user: UserEntity | null = null;

    if (id !== null && id !== undefined) {
      IDValidator.validate(id);
      user = await this.getUserUseCase.findById(id);
    }

    if (username !== null && username !== undefined) {
      UsernameValidator.validate(username, true);
      user = await this.getUserUseCase.findByUsername(username);
    }

    if (user == null) {
      throw new NotFoundItem('Não foi possivel encontrar o usuário');
    }

    return new HttpOKResponse('Usuário encontrado com sucesso', {
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      phonenumber: user.phonenumber,
    });
  }

  @Patch('/')
  @HttpCode(HttpStatus.OK)
  @ApiUpdateUser()
  async update(
    @Body() dto: UpdateUserDTO,
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    if (Object.keys(dto).length === 0) {
      throw new FieldInvalid(
        'Adicione algum campo para o usuário ser atualizado',
        'all',
      );
    }

    IDValidator.validate(id);

    const userUpdate = this.userMapper.updateDTOForEntity(dto, id);

    return new HttpUpdatedResponse(
      'Usuário atualizado com sucesso',
      await this.updateUserUseCase.execute(id, userUpdate),
    );
  }

  @Delete('/')
  @HttpCode(HttpStatus.OK)
  @ApiDeleteUser()
  async delete(
    @AuthorizationToken('authorization', IdInTokenPipe)
    id: string,
  ): Promise<HttpResponseOutbound> {
    IDValidator.validate(id);

    await this.deleteUserUseCase.execute(id);

    return new HttpDeletedResponse('Usuário deletado com sucesso');
  }
}
