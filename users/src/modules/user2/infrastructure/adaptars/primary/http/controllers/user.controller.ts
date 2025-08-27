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
} from '@nestjs/common';
import { v4 } from 'uuid';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UsersQueueService } from '../../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { defaultRoles } from '@modules/user2/domain/types/permissions';
import { ApiCreateUser } from '../../common/decorators/docs/api-create-user.decorator';
import {
  HttpCreatedResponse,
  HttpOKResponse,
  HttpResponseOutbound,
} from '@modules/user2/domain/ports/primary/http/sucess.port';
import { ApiFindOneUser } from '../../common/decorators/docs/api-find-one-user.decorator';
import { NotFoundUser } from '@modules/user2/domain/ports/primary/http/error.port';
import UsernameVO from '@modules/user2/domain/values-objects/user/username/username-vo';
import { IDValidator } from '@modules/user2/domain/values-objects/uuid/id-validator';
import { ApiUpdateUser } from '../../common/decorators/docs/api-update-user.decorator';
import { AuthorizationToken } from '../getValue/authorization-token.decorator';
import { BearerTokenPipe } from '@common/pipes/bearer-token.pipe';
import { UsernameValidator } from '@modules/user2/domain/values-objects/user/username/username-validator';
import { UserEntity } from '../../../secondary/database/entities/user.entity';

@Controller('users')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class UserController {
  constructor(
    private readonly usersQueueService: UsersQueueService,
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
    const userId = v4();

    const user = this.userMapper.createDTOForEntity(dto, userId);

    this.usersQueueService.send('user-created', {
      id: userId,
      email: dto.email,
      password: dto.password,
      roles: defaultRoles,
      email_verified: false,
      phone_verified: false,
    });

    await this.createUserUseCase.execute(user);

    return new HttpCreatedResponse('Usuário criado com sucesso');
  }

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
      UsernameValidator.validate(username);
      user = await this.getUserUseCase.findByUsername(username);
    }

    if (user == null) {
      throw new NotFoundUser();
    }

    return new HttpOKResponse('Usuário encontrado com sucesso', {
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      phonenumber: user.phonenumber,
    });
  }

  // @Patch('/')
  // @HttpCode(200)
  // @ApiUpdateUser()
  // async update(
  //   @Body() dto: UpdateUserDTO,
  //   @Header("authorization"):
  // ): Promise<UserControllerResponse> {
  //   if (!id) {
  //     throw new NotFoundException('Não foi possivel encontrar o usuário');
  //   }

  //   const newUser = this.userMapper.updateDTOForEntity(dto);

  //   if (Object.keys(newUser).length === 1) {
  //     throw new BadRequestException(
  //       'Adicione algum campo para o usuário ser atualizado',
  //     );
  //   }

  //   await this.updateUserUseCase.execute(id, newUser);

  //   return {
  //     message: 'Usuário atualizado com sucesso',
  //     data: undefined,
  //   };
  // }

  // @Delete(':id')
  // @HttpCode(200)
  // @ApiDeleteUser()
  // async delete(@Param('id') id: string): Promise<UserControllerResponse> {
  //   if (!id) {
  //     throw new NotFoundException('Não foi possivel encontrar o usuário');
  //   }

  //   await this.deleteUserUseCase.execute(id);

  //   return {
  //     message: 'Usuário deletado com sucesso',
  //     data: undefined,
  //   };
  // }
}
