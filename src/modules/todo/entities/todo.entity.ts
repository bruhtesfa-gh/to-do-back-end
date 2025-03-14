import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { Collection } from './collection.entity';
import { User } from 'src/modules/auth/entities/auth.entity';

@Entity()
export class Todo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: false })
  completed: boolean;
  
  @Column({ nullable: true })
  dueDate: Date;

  @ManyToOne(() => User, (user) => user.collections, {nullable : false})
  user: User;

  // If your Todo represents a task inside a collection, you can link it
  @ManyToOne(() => Collection, (collection) => collection.todos, {nullable : false, onDelete: 'CASCADE'} )
  collection: Collection;
  
  @RelationId((todo: Todo) => todo.collection)
  collectionId: number
  // For nested tasks, a self-referential relation
  @ManyToOne(() => Todo, (todo) => todo.childTodos, { nullable: true, onDelete: 'CASCADE' })
  parentTodo: Todo;

  @RelationId((todo: Todo) => todo.parentTodo)
  parentTodoId: number;

  @OneToMany(() => Todo, (todo) => todo.parentTodo)
  childTodos: Todo[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
