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
  constructor(private readonly colleService: CollectionService) {}

  @Get()
  async findAll(@Request() req) {
    const collections = await this.colleService.findAllByUser(req.user.id);
    return collections;
  }
  
  @Post()
  async create(@Body() createCollectionDto: CreateCollectionDto, @Request() req ) {
    const collection = await this.colleService.create(req.user.id, createCollectionDto);
    return collection;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateCollectionDto: UpdateCollectionDto) {
    const collection = await this.colleService.update(Number(id), updateCollectionDto);
    return collection;
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.colleService.remove(Number(id));
    return { message: 'Collection deleted successfully' };
  }
}
  