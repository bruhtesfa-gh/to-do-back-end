import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from './entities/todo.entity';
import { NotFoundException } from '@nestjs/common';

describe('TodoService', () => {
  let service: TodoService;
  let repository: Repository<Todo>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
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
  };;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(Todo),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TodoService>(TodoService);
    repository = module.get<Repository<Todo>>(getRepositoryToken(Todo));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
  
  
  describe('create', () => {
    it('should create a todo', async () => {
      mockRepository.create.mockReturnValue(mockTodo);
      mockRepository.save.mockResolvedValue(mockTodo);

      const result   = await service.create(1, mockTodo);

      expect(result).toEqual(mockTodo);
      expect(repository.create).toHaveBeenCalledWith({
        ...mockTodo,
        userId: 1,
      });
    });
  });

  describe('findAllByCollection', () => {
    it('should return an array of todos', async () => {
      const mockTodos = [mockTodo];
      mockRepository.find.mockResolvedValue(mockTodos);

      const result = await service.findAllByCollection(1);

      expect(result).toEqual(mockTodos);
      expect(repository.find).toHaveBeenCalledWith({
        where: { collectionId: 1 },
      });
    });
  });
  

  describe('update', () => {
    const updateTodoDto = {
      title: 'Updated Todo',
      description: 'Updated Description',
      dueDate: new Date(),
    };

    it('should update a todo', async () => {
      mockRepository.findOne.mockResolvedValue(mockTodo);
      mockRepository.save.mockResolvedValue({ ...mockTodo, ...updateTodoDto });

      const result = await service.update(1, updateTodoDto);

      expect(result).toEqual({ ...mockTodo, ...updateTodoDto });
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(repository.save).toHaveBeenCalled();
    });
  });


  describe('remove', () => {
    it('should successfully delete a todo', async () => {
      mockRepository.findOne.mockResolvedValue(mockTodo);
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1); // todoId = 1, userId = 1

      expect(repository.delete).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException when todo is not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
