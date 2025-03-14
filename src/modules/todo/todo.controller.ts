import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TodoService } from './todo.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiBody({ type: CreateTodoDto })
  async create(@Body() createTodoDto: CreateTodoDto, @Request() req) {
    const todo = await this.todoService.create(req.user.id, createTodoDto);
    return todo;
  }

  @Get('collection/:collectionId')
  async findAll(@Param('collectionId') collectionId: string) {
    const todos = await this.todoService.findAllByCollection(
      Number(collectionId),
    );
    return todos;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateTodoDto: UpdateTodoDto) {
    const todo = await this.todoService.update(Number(id), updateTodoDto);
    return todo;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.todoService.remove(Number(id));
    return { message: 'Todo deleted successfully' };
  }
}
