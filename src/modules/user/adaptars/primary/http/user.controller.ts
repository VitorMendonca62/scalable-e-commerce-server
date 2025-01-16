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
import { User } from 'src/modules/user/core/domain/user.entity';
import { UpdateUserDTO } from './dto/update-user.dto';

interface UserControllerResponse {
  message: string;
  data: User | User[] | undefined | null;
}

@Controller('user')
@UsePipes(new ValidationPipe({ stopAtFirstError: true }))
export class UserController {
  constructor(private readonly userMapper: UserMapper) {}

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

    // Chamar use case aqui

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
      data: undefined, // Chamar usecase aqui,
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
        data: undefined, // Chamar usecase aqui,
      };
    }

    if (username) {
      return {
        message: 'Aqui está usuário pelo username',
        data: undefined, // Chamar usecase aqui,
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

    // Chamar usecase aqui,

    return {
      message: 'Aqui está usuário pelo username',
      data: undefined,
    };
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<UserControllerResponse> {
    if (!id) {
      throw new NotFoundException('Não foi possivel encontrar o usuário');
    }

    // Chamar usecase aqui

    return {
      message: 'Aqui está usuário pelo username',
      data: undefined,
    };
  }
}
