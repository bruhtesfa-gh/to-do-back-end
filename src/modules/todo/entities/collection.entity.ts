import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Todo } from './todo.entity';
import { User } from 'src/modules/auth/entities/auth.entity';

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  image: string;

  @ManyToOne(() => User, (user) => user.collections)
  user: User;

  @OneToMany(() => Todo, (task) => task.collection)
  todos: Todo[];
}
