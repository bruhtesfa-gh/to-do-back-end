import { Test, TestingModule } from '@nestjs/testing';
import { CollectionController } from 'src/modules/todo/collection.controller';
import { CollectionService } from 'src/modules/todo/collection.service';
import { CreateCollectionDto } from 'src/modules/todo/dto/create-collection.dto';
import { UpdateCollectionDto } from 'src/modules/todo/dto/update-collection.dto';

describe('CollectionController', () => {
  let controller: CollectionController;
  let collectionService: {
    findAllByUser: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    remove: jest.Mock;
  };

  const mockCollection = {
    id: 1,
    name: 'Test Collection',
    image: 'test.jpg',
    isFavorite: false,
    tasksCompleted: 0,
    totalTasks: 0,
    todos: [],
  };

  beforeEach(async () => {
    collectionService = {
      findAllByUser: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionController],
      providers: [
        { provide: CollectionService, useValue: collectionService },
      ],
    }).compile();

    controller = module.get<CollectionController>(CollectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of collections', async () => {
      const mockCollections = [mockCollection];
      const mockRequest = {
        user: { id: 1 }
      };

      collectionService.findAllByUser.mockResolvedValue(mockCollections);

      const result = await controller.findAll(mockRequest);

      expect(result).toEqual(mockCollections);
      expect(collectionService.findAllByUser).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new collection', async () => {
      const createDto: CreateCollectionDto = {
        name: 'New Collection',
        image: 'new.jpg',
        isFavorite: false
      };

      const mockRequest = {
        user: { id: 1 }
      };

      const expectedResult = {
        ...mockCollection,
        ...createDto
      };

      collectionService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createDto, mockRequest);

      expect(result).toEqual(expectedResult);
      expect(collectionService.create).toHaveBeenCalledWith(1, createDto);
    });
  });

  describe('update', () => {
    it('should update a collection', async () => {
      const updateDto: UpdateCollectionDto = {
        name: 'Updated Collection',
        isFavorite: true
      };

      const expectedResult = {
        ...mockCollection,
        ...updateDto
      };

      collectionService.update.mockResolvedValue(expectedResult);

      const result = await controller.update('1', updateDto);

      expect(result).toEqual(expectedResult);
      expect(collectionService.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should handle non-existent collection', async () => {
      const updateDto: UpdateCollectionDto = {
        name: 'Updated Collection'
      };

      collectionService.update.mockResolvedValue(null);

      const result = await controller.update('1', updateDto);

      expect(result).toBeNull();
      expect(collectionService.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a collection and return success message', async () => {
      const expectedResponse = { message: 'Collection deleted successfully' };
      collectionService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toEqual(expectedResponse);
      expect(collectionService.remove).toHaveBeenCalledWith(1);
    });
  });
});
