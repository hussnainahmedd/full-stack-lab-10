import {
  Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne,
  PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../users/user.entity';
import { Tag } from './tag.entity';
import { Category } from '../categories/category.entity';

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  content: string;

  @Column({ default: false })
  isPinned: boolean;

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Many-to-One: creates the "authorId" foreign key column in the notes table
  @ManyToOne(() => User, (user) => user.notes, { nullable: false, onDelete: 'CASCADE' })
  author: Relation<User>;

  // Many-to-One: a note belongs to at most one category; deleting a
  // category sets this to NULL so the note survives. The "| null" in the
  // type is what makes this relation nullable in TypeScript too.
  @ManyToOne(() => Category, (category) => category.notes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category: Relation<Category | null>;

  // Many-to-Many: @JoinTable creates the junction table (notes_tags_tags)
  @ManyToMany(() => Tag, (tag) => tag.notes)
  @JoinTable()
  tags: Relation<Tag[]>;
}
