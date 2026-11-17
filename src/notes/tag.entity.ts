import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Note } from './note.entity';

@Entity('tags')
export class Tag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  name: string;

  @ManyToMany(() => Note, (note) => note.tags)
  notes: Relation<Note[]>;
}
