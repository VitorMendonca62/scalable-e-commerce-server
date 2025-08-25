import { CreateUserUseCase } from '@modules/user2/application/use-cases/create-user.usecase';
import { DeleteUserUseCase } from '@modules/user2/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from '@modules/user2/application/use-cases/get-user.usecase';
import { GetUsersUseCase } from '@modules/user2/application/use-cases/get-users.usecase';
import { UpdateUserUseCase } from '@modules/user2/application/use-cases/update-user.usecase';
import { UserMapper } from '@modules/user2/infrastructure/mappers/user.mapper';
import { Controller, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { v4 } from 'uuid';
import { CreateUserDTO } from '../dtos/create-user.dto';
import { UsersQueueService } from '../../../secondary/message-broker/rabbitmq/users_queue/users-queue.service';
import { defaultRoles } from '@modules/user2/domain/types/permissions';

@Controller('users')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class UserController {
  constructor(
    private readonly usersQueueService: UsersQueueService,
    private readonly userMapper: UserMapper,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsesrUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  async create(@Body() dto: CreateUserDTO) {
    const userId = v4();

    const user = this.userMapper.createDTOForEntity(dto, userId);

    this.usersQueueService.send('user-created', {
      id: userId,
      roles: defaultRoles,
      email: dto.email,
      name: dto.name,
      username: dto.username,
      phonenumber: dto.phonenumber,
    });

    await this.createUserUseCase.execute(user);
  }

  // @Get()
  // @HttpCode(200)
  // @ApiGetAllUsers()
  // async getAll(): Promise<UserControllerResponse> {
  //   return {
  //     message: 'Aqui está a listagem de todos os usuários',
  //     data: await this.getUsesrUseCase.getAll(),
  //   };
  // }

  // @Get('/find')
  // @HttpCode(200)
  // @ApiFindOneUser()
  // async findOne(
  //   @Query('id') id?: string,
  //   @Query('username') username?: string,
  // ): Promise<UserControllerResponse> {
  //   if (id) {
  //     return {
  //       message: 'Aqui está usuário pelo ID',
  //       data: await this.getUserUseCase.findById(id),
  //     };
  //   }

  //   if (username) {
  //     return {
  //       message: 'Aqui está usuário pelo username',
  //       data: await this.getUserUseCase.findByUsername(username),
  //     };
  //   }

  //   throw new NotFoundException('Não foi possivel encontrar o usuário');
  // }

  // @Patch(':id')
  // @HttpCode(200)
  // @ApiUpdateUser()
  // async update(
  //   @Param('id') id: string,
  //   @Body() dto: UpdateUserDTO,
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
