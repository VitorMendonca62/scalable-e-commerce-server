import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserMapper } from '../../../mappers/user.mapper';
import { User } from '@user/core/domain/user.entity';
import { UpdateUserDTO } from '../dto/update-user.dto';
import { DeleteUserUseCase } from '@user/core/application/use-cases/delete-user.usecase';
import { GetUserUseCase } from '@user/core/application/use-cases/get-user.usecase';
import { GetUsersUseCase } from '@user/core/application/use-cases/get-users.usecase';
import { UpdateUserUseCase } from '@user/core/application/use-cases/update-user.usecase';

interface UserControllerResponse {
  message: string;
  data: User | User[] | undefined | null;
}

@Controller('user')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class UserController {
  constructor(
    private readonly userMapper: UserMapper,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsesrUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Get()
  @HttpCode(200)
  async findAll(): Promise<UserControllerResponse> {
    return {
      message: 'Aqui está a listagem de todos os usuários',
      data: await this.getUsesrUseCase.findAll(),
    };
  }

  @Get('/find')
  @HttpCode(200)
  async findOne(
    @Query('id') id?: string,
    @Query('username') username?: string,
  ): Promise<UserControllerResponse> {
    if (id) {
      return {
        message: 'Aqui está usuário pelo ID',
        data: await this.getUserUseCase.findById(id),
      };
    }

    if (username) {
      return {
        message: 'Aqui está usuário pelo username',
        data: await this.getUserUseCase.findByUsername(username),
      };
    }

    throw new NotFoundException('Não foi possivel encontrar o usuário');
  }

  @Patch(':id')
  @HttpCode(200)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDTO,
  ): Promise<UserControllerResponse> {
    if (!id) {
      throw new NotFoundException('Não foi possivel encontrar o usuário');
    }

    const newUser = this.userMapper.updateDTOForEntity(dto);

    if (Object.keys(newUser).length === 1) {
      throw new BadRequestException(
        'Adicione algum campo para o usuário ser atualizado',
      );
    }

    await this.updateUserUseCase.execute(id, newUser);

    return {
      message: 'Usuário atualizado com sucesso',
      data: undefined,
    };
  }

  @Delete(':id')
  @HttpCode(200)
  async delete(@Param('id') id: string): Promise<UserControllerResponse> {
    if (!id) {
      throw new NotFoundException('Não foi possivel encontrar o usuário');
    }

    await this.deleteUserUseCase.execute(id);

    return {
      message: 'Usuário deletado com sucesso',
      data: undefined,
    };
  }
}
