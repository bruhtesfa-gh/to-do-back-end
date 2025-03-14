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
import { CreateCollectionDto } from './dto/create-collection.dto';
import { CollectionService } from './collection.service';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
  
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('collection')
export class CollectionController {
  constructor(private readonly todoService: CollectionService) {}

  @Get()
  async findAll(@Request() req) {
    const collections = await this.todoService.findAllByUser(req.user.id);
    return { data: collections };
  }
  
  @Post()
  async create(@Body() createCollectionDto: CreateCollectionDto, @Request() req ) {
    const todo = await this.todoService.create(req.user.id, createCollectionDto);
    return { data: todo };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    const todo = await this.todoService.update(Number(id), updateCollectionDto);
    return { data: todo };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.todoService.remove(Number(id));
    return { message: 'Collection deleted successfully' };
  }
}
  