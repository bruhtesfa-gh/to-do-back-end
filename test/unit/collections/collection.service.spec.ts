import { Test, TestingModule } from '@nestjs/testing';
import { CollectionService } from 'src/modules/todo/collection.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Collection } from 'src/modules/todo/entities/collection.entity';
import { Repository } from 'typeorm';
import { CreateCollectionDto } from 'src/modules/todo/dto/create-collection.dto';
import { UpdateCollectionDto } from 'src/modules/todo/dto/update-collection.dto';
import { User } from 'src/modules/auth/entities/auth.entity';

describe('CollectionService', () => {
  let service: CollectionService;
  let repository: Repository<Collection>;

  const mockRepository = {
    find: jest.fn(),
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
    image: 'test.jpg',
    isFavorite: false,
    tasksCompleted: 0,
    totalTasks: 0,
    user: mockUser as User,
    todos: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CollectionService,
        {
          provide: getRepositoryToken(Collection),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CollectionService>(CollectionService);
    repository = module.get<Repository<Collection>>(getRepositoryToken(Collection));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAllByUser', () => {
    it('should return all collections for a user', async () => {
      const mockCollections = [mockCollection];
      mockRepository.find.mockResolvedValue(mockCollections);

      const result = await service.findAllByUser(1);

      expect(result).toEqual(mockCollections);
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['todos'],
      });
    });

    it('should return empty array when user has no collections', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAllByUser(1);

      expect(result).toEqual([]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { user: { id: 1 } },
        relations: ['todos'],
      });
    });
  });

  describe('create', () => {
    it('should create a new collection', async () => {
      const createDto: CreateCollectionDto = {
        name: 'New Collection',
        image: 'new.jpg',
        isFavorite: false,
      };

      const expectedCollection = {
        ...createDto,
        user: { id: 1 } as User,
      };

      const savedCollection = {
        ...expectedCollection,
        id: 1,
        tasksCompleted: 0,
        totalTasks: 0,
        todos: [],
      };

      mockRepository.create.mockReturnValue(expectedCollection);
      mockRepository.save.mockResolvedValue(savedCollection);

      const result = await service.create(1, createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.save).toHaveBeenCalledWith(expectedCollection);
      expect(result).toEqual(savedCollection);
    });

    it('should set default values when optional fields are not provided', async () => {
      const createDto: CreateCollectionDto = {
        name: 'New Collection',
        image: 'new.jpg',
      };

      const expectedCollection = {
        ...createDto,
        isFavorite: false,
        user: { id: 1 } as User,
      };

      mockRepository.create.mockReturnValue(expectedCollection);
      mockRepository.save.mockResolvedValue({ ...expectedCollection, id: 1 });

      const result = await service.create(1, createDto);

      expect(result.isFavorite).toBe(false);
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a collection', async () => {
      const updateDto: UpdateCollectionDto = {
        name: 'Updated Collection',
        isFavorite: true,
      };

      const updatedCollection = {
        ...mockCollection,
        ...updateDto,
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue(updatedCollection);

      const result = await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual(updatedCollection);
    });

    it('should return null if collection not found', async () => {
      const updateDto: UpdateCollectionDto = {
        name: 'Updated Collection',
      };

      mockRepository.update.mockResolvedValue({ affected: 0 });
      mockRepository.findOneBy.mockResolvedValue(null);

      const result = await service.update(999, updateDto);

      expect(result).toBeNull();
      expect(repository.update).toHaveBeenCalledWith(999, updateDto);
      expect(repository.findOneBy).toHaveBeenCalledWith({ id: 999 });
    });

    it('should update partial fields', async () => {
      const updateDto: UpdateCollectionDto = {
        name: 'Updated Collection',
      };

      const updatedCollection = {
        ...mockCollection,
        name: 'Updated Collection',
      };

      mockRepository.update.mockResolvedValue({ affected: 1 });
      mockRepository.findOneBy.mockResolvedValue(updatedCollection);

      const result = await service.update(1, updateDto);

      expect(repository.update).toHaveBeenCalledWith(1, updateDto);
      expect(result).toEqual(updatedCollection);
    });
  });

  describe('remove', () => {
    it('should remove a collection', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(1);

      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should not throw error if collection does not exist', async () => {
      mockRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).resolves.not.toThrow();
      expect(repository.delete).toHaveBeenCalledWith(999);
    });
  });
});
