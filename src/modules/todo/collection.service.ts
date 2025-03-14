import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Collection } from './entities/collection.entity';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { User } from '../auth/entities/auth.entity';

@Injectable()
export class CollectionService {
  constructor(
    @InjectRepository(Collection)
    private collRepository: Repository<Collection>,
  ) {}
  
  async findAllByUser(userId: number): Promise<Collection[]> {
    return this.collRepository.find({
      where: { user: { id: userId } },
      relations: ['todos'],
    });
  }

  async create(userId: number, createCollectionDto: CreateCollectionDto): Promise<Collection> {
    const collection = this.collRepository.create(createCollectionDto);
    collection.user = { id: userId } as User; // using a partial User object
    return this.collRepository.save(collection);
  }

  async update(id: number, updateCollectionDto: UpdateCollectionDto): Promise<Collection> {
    await this.collRepository.update(id, updateCollectionDto);
    return this.collRepository.findOneBy({id});
  }

  async remove(id: number): Promise<void> {
    await this.collRepository.delete(id);
  }
}
