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
  
  @Column({default : 0})
  tasksCompleted: number;

  @Column({default : 0})
  totalTasks: number;

  @Column({default : false})
  isFavorite: boolean;

  @ManyToOne(() => User, (user) => user.collections)
  user: User;

  @OneToMany(() => Todo, (task) => task.collection, { cascade: true })
  todos: Todo[];
}
