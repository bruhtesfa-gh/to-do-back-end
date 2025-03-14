import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { Collection } from './entities/collection.entity';
import { CollectionController } from './collection.controller';
import { CollectionService } from './collection.service';

@Module({
  imports: [TypeOrmModule.forFeature([Todo, Collection])],
  controllers: [TodoController, CollectionController],
  providers: [TodoService, CollectionService],
  exports: [TodoService, CollectionService],
})
export class TodoModule {}
