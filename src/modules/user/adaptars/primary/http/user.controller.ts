import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { UserMapper } from '../../mappers/user.mapper';
import { User } from '@user/core/domain/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';
import { CreateUserUseCase } from '@user/core/application/use-cases/create-user.usecase';
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
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly getUsesrUseCase: GetUsersUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateUserDTO): Promise<UserControllerResponse> {
    const { email, name, password, phonenumber, username } = dto;

    const user = this.userMapper.create({
      email,
      name,
      password,
      phonenumber,
      username,
    });

    await this.createUserUseCase.execute(user);

    return {
      message: 'Usuário criado com sucesso',
      data: undefined,
    };
  }

  @Get()
  @HttpCode(200)
  async findAll(): Promise<UserControllerResponse> {
    return {
      message: 'Aqui está a listagem de todos os usuários',
      data: await this.getUsesrUseCase.findAll(),
    };
  }

  @Get('/search')
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
  async update(
    @Param('id') id: string,
    dto: UpdateUserDTO,
  ): Promise<UserControllerResponse> {
    if (!id) {
      throw new NotFoundException('Não foi possivel encontrar o usuário');
    }

    const { email, name, phonenumber, username } = dto;

    const newUser = this.userMapper.update({
      email,
      name,
      phonenumber,
      username,
    });

    await this.updateUserUseCase.execute(id, newUser);

    return {
      message: 'O usuário foi atualizado com sucesso',
      data: undefined,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<UserControllerResponse> {
    if (!id) {
      throw new NotFoundException('Não foi possivel encontrar o usuário');
    }

    await this.deleteUserUseCase.execute(id);

    return {
      message: 'Aqui está usuário pelo username',
      data: undefined,
    };
  }
}
