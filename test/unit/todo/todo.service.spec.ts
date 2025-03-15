import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from 'src/modules/todo/todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Todo } from 'src/modules/todo/entities/todo.entity';
import { Repository } from 'typeorm';
import { CreateTodoDto } from 'src/modules/todo/dto/create-todo.dto';
import { UpdateTodoDto } from 'src/modules/todo/dto/update-todo.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Collection } from 'src/modules/todo/entities/collection.entity';
import { User } from 'src/modules/auth/entities/auth.entity';

describe('TodoService', () => {
  let service: TodoService;
  let repository: Repository<Todo>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  // Mock data
  const mockUser: Partial<User> = {
    id: 1,
    email: 'test@example.com',
  };

  const mockCollection: Partial<Collection> = {
    id: 1,
    name: 'Test Collection',
    user: mockUser as User,
  };

  const mockTodo: Partial<Todo> = {
    id: 1,
    title: 'Test Todo',
    description: 'Test Description',
    completed: false,
    dueDate: new Date('2024-03-20'),
    user: mockUser as User,
    userId: 1,
    collection: mockCollection as Collection,
    collectionId: 1,
    parentTodo: null,
    parentTodoId: null,
    childTodos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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
    const createDto: CreateTodoDto = {
      title: 'New Todo',
      description: 'New Description',
      collectionId: 1,
      dueDate: new Date('2024-03-20'),
    };

    it('should create a todo without parent', async () => {
      const expectedTodo = {
        ...createDto,
        user: { id: 1 },
        collection: { id: 1 },
      };

      mockRepository.create.mockReturnValue(expectedTodo);
      mockRepository.save.mockResolvedValue({ ...expectedTodo, id: 1 });

      const result = await service.create(1, createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(expectedTodo);
      expect(result).toHaveProperty('id', 1);
      expect(result.collectionId).toBe(1);
      expect(result.user.id).toBe(1);
    });

    it('should create a nested todo', async () => {
        const parentDTO : CreateTodoDto = {
          title: 'Parent Todo',
          description: 'Parent Description',
          collectionId: 1,
          dueDate: new Date('2024-03-20'),
        };
    
        const expectedParentTodo = {
          ...parentDTO,
          user: { id: 1 },
          collection: { id: 1 },
        };
    
        mockRepository.create.mockReturnValue(expectedParentTodo);
        mockRepository.save.mockResolvedValue({...expectedParentTodo, id: 1});
        const parentTodo = await service.create(1, parentDTO);
        // console.log("parentTodo", parentTodo);
        expect(repository.create).toHaveBeenCalledWith(parentDTO);
        expect(repository.save).toHaveBeenCalledWith(expectedParentTodo);
        expect(parentTodo).toHaveProperty('id', 1);
        expect(parentTodo.collectionId).toBe(1);
        expect(parentTodo.user.id).toBe(1);
        
        const createNestedDto: CreateTodoDto = {
          ...createDto,
          parentTodoId: parentTodo.id,
        };
    
        const expectedNestedTodo = {
          ...createNestedDto,
          user: { id: 1 },    
          parentTodoId: parentTodo.id,
          collectionId: 1,
        };
        
        mockRepository.findOne.mockResolvedValueOnce(parentTodo);
        mockRepository.create.mockReturnValue(expectedNestedTodo);
        mockRepository.save.mockResolvedValue({...expectedNestedTodo, id: 2});

        const result = await service.create(1, createNestedDto);
        expect(repository.create).toHaveBeenCalledWith(createNestedDto);
        expect(repository.save).toHaveBeenCalledWith(expectedNestedTodo);
        expect(result).toHaveProperty('id', 2);
        expect(result.collectionId).toBe(1);
        expect(result.user.id).toBe(1);
        expect(result.parentTodoId).toBe(parentTodo.id);  
    });

    it('should throw NotFoundException when parent todo not found', async () => {
      const createNestedDto: CreateTodoDto = {
        ...createDto,
        parentTodoId: 999,
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.create(1, createNestedDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 999 },
      });
    });

    it('should throw BadRequestException when parent todo is in different collection', async () => {
      const createNestedDto: CreateTodoDto = {
        ...createDto,
        parentTodoId: 1,
      };

      const parentTodo = {
        id: 1,
        collectionId: 2, // Different collection
      };

      mockRepository.findOne.mockResolvedValue(parentTodo);

      await expect(service.create(1, createNestedDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('findAllByCollection', () => {
    it('should return todos in tree structure', async () => {
      const mockTodos = [
        { ...mockTodo, id: 1, parentTodoId: null },
        { ...mockTodo, id: 2, parentTodoId: 1 },
        { ...mockTodo, id: 3, parentTodoId: 1 },
        { ...mockTodo, id: 4, parentTodoId: null },
      ];

      mockRepository.find.mockResolvedValue(mockTodos);

      const result = await service.findAllByCollection(1);

      expect(result).toHaveLength(2); // Two root todos
      expect(result[0].childTodos).toHaveLength(2); // First todo has two children
      expect(result[1].childTodos).toHaveLength(0); // Second todo has no children
      expect(repository.find).toHaveBeenCalledWith({
        where: { collection: { id: 1 } },
      });
    });

    it('should handle deeply nested todos', async () => {
      const mockTodos = [
        { ...mockTodo, id: 1, parentTodoId: null },
        { ...mockTodo, id: 2, parentTodoId: 1 },
        { ...mockTodo, id: 3, parentTodoId: 2 },
      ];

      mockRepository.find.mockResolvedValue(mockTodos);

      const result = await service.findAllByCollection(1);

      expect(result).toHaveLength(1);
      expect(result[0].childTodos).toHaveLength(1);
      expect(result[0].childTodos[0].childTodos).toHaveLength(1);
    });

    it('should handle empty collection', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllByCollection(1);

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { collection: { id: 1 } },
      });
    });
  });

  describe('update', () => {
    it('should update a todo', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Updated Todo',
      };

      const updatedTodo = {
        ...mockTodo,
        ...updateDto,
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue(updatedTodo);

      const result = await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedTodo);
      expect(result.title).toBe('Updated Todo');
    });

    it('should handle partial updates', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Updated Todo',
      };

      const updatedTodo = {
        ...mockTodo,
        title: 'Updated Todo',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue(updatedTodo);

      const result = await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result.title).toBe(updatedTodo.title);
    });

    it('should return null when todo not found', async () => {
      const updateDto: UpdateTodoDto = {
        title: 'Updated Todo',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.update(999, updateDto);

      expect(result).toBeNull();
      expect(repository.update).toHaveBeenCalledWith(999, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a todo', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should handle non-existent todo removal', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).resolves.not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(999);
    });
  });
});
