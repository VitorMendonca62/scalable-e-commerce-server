import { Body, Controller, Post } from '@nestjs/common';
import { CreateItemDTO } from './dtos/create-item.dto';

@Controller('item')
export class ItemController {
  @Post('/')
  async create(@Body() dto: CreateItemDTO) {
    throw new Error('Method not implemeting');
  }

  @Get('/:')
  async getOne() {
    throw new Error('Method not implemeting');
  }

  @Post('/')
  async getlAll() {
    throw new Error('Method not implemeting');
  }

  @Post('/')
  async getlSome() {
    throw new Error('Method not implemeting');
  }

  @Post('/')
  async rating() {
    throw new Error('Method not implemeting');
  }
  @Post('/')
  async update() {
    throw new Error('Method not implemeting');
  }
  @Post('/')
  async delete() {
    throw new Error('Method not implemeting');
  }
}
