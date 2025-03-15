import { Test, TestingModule } from '@nestjs/testing';
import { TodoController } from 'src/modules/todo/todo.controller';
import { TodoService } from 'src/modules/todo/todo.service';
import { CreateTodoDto } from 'src/modules/todo/dto/create-todo.dto';
import { UpdateTodoDto } from 'src/modules/todo/dto/update-todo.dto';

describe('TodoController', () => {
  let controller: TodoController;
  let todoService: {
    create: jest.Mock;
    findAllByCollection: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockTodo = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    dueDate: new Date(),
    collectionId: 1,
    userId: 1,
    parentTodoId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    childTodos: [],
  };

  beforeEach(async () => {
    todoService = {
      create: jest.fn(),
      findAllByCollection: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TodoController],
      providers: [
        {
          provide: TodoService,
          useValue: todoService,
        },
      ],
    }).compile();

    controller = module.get<TodoController>(TodoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new todo', async () => {
      const createDto: CreateTodoDto = {
        title: 'New Todo',
        description: 'New Description',
        collectionId: 1,
        dueDate: new Date(),
        parentTodoId: null,
      };

      const mockRequest = {
        user: { id: 1 }
      };

      const expectedResult = {
        ...mockTodo,
        ...createDto
      };

      todoService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(todoService.create).toHaveBeenCalledWith(1, createDto);
    });

    it('should create a nested todo', async () => {
      const createDto: CreateTodoDto = {
        title: 'Nested Todo',
        description: 'Nested Description',
        collectionId: 1,
        parentTodoId: 1,
        dueDate: new Date(),
      };

      const mockRequest = {
        user: { id: 1 }
      };

      const expectedResult = {
        ...mockTodo,
        ...createDto,
        id: 2
      };

      todoService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(todoService.create).toHaveBeenCalledWith(1, createDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of todos for a collection', async () => {
      const mockTodos = [
        mockTodo,
        {
          ...mockTodo,
          id: 2,
          parentTodoId: 1,
        }
      ];

      todoService.findAllByCollection.mockResolvedValue(mockTodos);

      const result = await controller.findAll('1');

      expect(result).toEqual(mockTodos);
      expect(todoService.findAllByCollection).toHaveBeenCalledWith(1);
    });

    it('should return empty array when collection has no todos', async () => {
      todoService.findAllByCollection.mockResolvedValue([]);

      const result = await controller.findAll('1');

      expect(result).toEqual([]);
      expect(todoService.findAllByCollection).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Updated Todo',
      };

      const expectedResult = {
        ...mockTodo,
        ...updateDto
      };

      todoService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(todoService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Updated Todo',
      };

      const expectedResult = {
        ...mockTodo,
        title: 'Updated Todo',
      };

      todoService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(todoService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle non-existent todo', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Updated Todo',
      };

      todoService.update.mockResolvedValue(null);

      const result = await controller.update('999', updateDto);

      expect(result).toBeNull();
      expect(todoService.update).toHaveBeenCalledWith(999, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a todo and return success message', async () => {
      const expectedResponse = { message: 'Todo deleted successfully' };
      todoService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResponse);
      expect(todoService.remove).toHaveBeenCalledWith(1);
    });

    it('should handle removal of todo with nested todos', async () => {
      const expectedResponse = { message: 'Todo deleted successfully' };
      todoService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResponse);
      expect(todoService.remove).toHaveBeenCalledWith(1);
    });
  });
});
