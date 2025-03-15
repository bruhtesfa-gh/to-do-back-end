import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { User } from '../auth/entities/auth.entity';
import { Collection } from './entities/collection.entity';



function buildTodoTree(todos: Todo[]): Todo[] {
  // Create a map for quick lookup of todos by id, and initialize childTodos as empty array.
  const todoMap = new Map<number, Todo>();

  // Initialize the map with todos and an empty childTodos array for each todo.
  todos.forEach(todo => {
    todoMap.set(todo.id, { ...todo, childTodos: [] });
  });

  const tree: Todo[] = [];

  // Iterate over the todos and assign them to their parent's childTodos array, if a parent exists.
  todoMap.forEach((todo) => {
    if (todo.parentTodoId != null) {
      const parent = todoMap.get(todo.parentTodoId);
      if (parent) {
        parent.childTodos.push(todo);
      } else {
        // If no valid parent exists, treat it as a top-level todo.
        tree.push(todo);
      }
    } else {
      // Top-level todos (with no parentId) are added to the tree directly.
      tree.push(todo);
    }
  });

  return tree;
}

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo)
    private todoRepository: Repository<Todo>,
  ) {}

  async create(userId: number, createTodoDto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create(createTodoDto);
    todo.collection = { id: createTodoDto.collectionId } as Collection; // using a partial User object
    todo.user = { id: userId } as User; // using a partial User object
    if(createTodoDto.parentTodoId){
      const parent = await this.todoRepository.findOne({
         where : {
            id : createTodoDto.parentTodoId
         }
      });

      if (!parent) {
        throw new NotFoundException('Parent todo not found');
      }

      if (parent.collectionId !== createTodoDto.collectionId) {
        throw new BadRequestException('Parent todo must be in the same collection');
      }
      todo.parentTodo = parent
    }
    return await this.todoRepository.save(todo);
  }

  async findAllByCollection(collectionId: number): Promise<Todo[]> {
    const todos = await this.todoRepository.find({
      where: { collection: { id: collectionId }},
    });
    return buildTodoTree(todos)
  }

  async update(id: number, updateTodoDto: UpdateTodoDto): Promise<Todo> {
    await this.todoRepository.update(id, updateTodoDto);
    return this.todoRepository.findOneBy({id});
  }

  async remove(id: number): Promise<void> {
    await this.todoRepository.delete(id);
  }
}
