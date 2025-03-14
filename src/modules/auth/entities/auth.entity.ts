import { Collection } from 'src/modules/todo/entities/collection.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// You might import other entities that relate to the user, e.g. Todos or Collections

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  // Optionally, if you want to relate the user to Todos or Collections:
  @OneToMany(() => Collection, collection => collection.user)
  collections: Collection[];
}
