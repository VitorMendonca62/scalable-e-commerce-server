import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateItemDTO } from './dtos/create-item.dto';

@Controller('item')
export class ItemController {
  @Post('/create')
  async create(@Body() dto: CreateItemDTO) {
    throw new Error('Method not implemeting');
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    throw new Error('Method not implemeting');
  }

  @Get('/items')
  async getAll() {
    throw new Error('Method not implemeting');
  }

  @Get('/filter')
  async filter(@Query() query: Record<string, any>) {
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
