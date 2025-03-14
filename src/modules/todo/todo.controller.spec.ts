import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from './todo.controller';
import { TodoService } from './todo.service';
import { NotFoundException } from '@nestjs/common';
import { Todo } from './entities/todo.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';

describe('TodoController', () => {
  let controller: TodoController;
  let service: TodoService;

  const mockTodoService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockTodo : Todo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    dueDate: new Date(),
    userId: 1,
    collectionId: 1,
    parentTodoId: 0,
    parentTodo: null,
    childTodos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    user: { id: 1, email: 'test@example.com', passwordHash: 'password123', collections: [] },
    collection: { id: 1, name: 'Test Collection', todos: [], image: null, tasksCompleted: 0, totalTasks: 0, isFavorite: false, user: { id: 1, email: 'test@example.com', passwordHash: 'password123', collections: [] } },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: mockTodoService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
    service = module.get<TodoService>(TodoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of todos', async () => {
      const mockTodos = [mockTodo];
      mockTodoService.findAll.mockResolvedValue(mockTodos);

      const result = await controller.findAll('1');

      expect(result).toEqual(mockTodos);
      expect(service.findAllByCollection).toHaveBeenCalledWith(1);
    });
  });


  describe('create', () => {
    const createTodoDto : CreateTodoDto = {
      title: 'Test Todo',
      description: 'Test Description',
      collectionId: 1,
    };

    it('should create a todo', async () => {
      mockTodoService.create.mockResolvedValue(mockTodo);

      const result = await controller.create(createTodoDto, { user: { id: 1 } });

      expect(result).toEqual(mockTodo);
      expect(service.create).toHaveBeenCalledWith(createTodoDto, 1);
    });
  });

  describe('update', () => {
    const updateTodoDto : UpdateTodoDto = {
      title: 'Updated Todo',
      description: 'Updated Description',
      dueDate: new Date(),
    };

    it('should update a todo', async () => {
      const updatedTodo = { ...mockTodo, ...updateTodoDto };
      mockTodoService.update.mockResolvedValue(updatedTodo);

      const result = await controller.update('1', updateTodoDto);

      expect(result).toEqual(updatedTodo);
      expect(service.update).toHaveBeenCalledWith(1, updateTodoDto, 1);
    });

    it('should throw NotFoundException when todo is not found', async () => {
      mockTodoService.update.mockRejectedValue(new NotFoundException());

      await expect(
        controller.update('1', updateTodoDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a todo', async () => {
      await controller.remove('1');

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when todo is not found', async () => {
      mockTodoService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
