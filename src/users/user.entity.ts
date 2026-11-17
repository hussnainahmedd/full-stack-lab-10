import {
  Column, CreateDateColumn, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Profile } from './profile.entity';
import { Note } from '../notes/note.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  // One-to-One: the foreign key lives in the profiles table (see Profile)
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Relation<Profile>;

  // One-to-Many: one user writes many notes
  @OneToMany(() => Note, (note) => note.author)
  notes: Relation<Note[]>;
}
