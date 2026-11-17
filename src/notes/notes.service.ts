import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Note } from './note.entity';
import { Tag } from './tag.entity';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { CreateNoteDto } from './create-note.dto';
import { UpdateNoteDto } from './update-note.dto';
import { QueryNotesDto } from './query-notes.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectRepository(Note) private readonly notesRepo: Repository<Note>,
    @InjectRepository(Tag) private readonly tagsRepo: Repository<Tag>,
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Category) private readonly categoriesRepo: Repository<Category>,
  ) {}

  // Tags are shared, not duplicated: find the row by name or create it once.
  private async resolveTags(names: string[] = []): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const raw of names) {
      const name = raw.trim().toLowerCase();
      if (!name) continue;
      let tag = await this.tagsRepo.findOneBy({ name });
      if (!tag) tag = await this.tagsRepo.save(this.tagsRepo.create({ name }));
      tags.push(tag);
    }
    return tags;
  }

  // A categoryId that does not exist is a client error (404), not a crash.
  private async resolveCategory(categoryId?: number): Promise<Category | null> {
    if (categoryId === undefined) return null;
    const category = await this.categoriesRepo.findOneBy({ id: categoryId });
    if (!category) throw new NotFoundException(`Category ${categoryId} not found`);
    return category;
  }

  // Loads a note WITHOUT counting a view (used by update and internally).
  private async getNoteOrFail(id: number): Promise<Note> {
    const note = await this.notesRepo.findOne({
      where: { id },
      relations: { author: true, tags: true, category: true },
    });
    if (!note) throw new NotFoundException(`Note ${id} not found`);
    return note;
  }

  async create(dto: CreateNoteDto): Promise<Note> {
    const author = await this.usersRepo.findOneBy({ id: dto.authorId });
    if (!author) throw new NotFoundException(`User ${dto.authorId} not found`);
    const category = await this.resolveCategory(dto.categoryId);
    const note = this.notesRepo.create({
      title: dto.title,
      content: dto.content,
      isPinned: dto.isPinned ?? false,
      author,
      category,
      tags: await this.resolveTags(dto.tags),
    });
    return this.notesRepo.save(note);
  }

  // Task 6: ONE QueryBuilder handles pagination + all filters together.
  async findAll(
    query: QueryNotesDto,
  ): Promise<{ data: Note[]; total: number; page: number; limit: number }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const qb = this.notesRepo
      .createQueryBuilder('note')
      .leftJoinAndSelect('note.author', 'author')
      .leftJoinAndSelect('note.category', 'category')
      .leftJoinAndSelect('note.tags', 'tags');
    if (query.tag) {
      qb.innerJoin('note.tags', 'filterTag', 'filterTag.name = :tag', {
        tag: query.tag.toLowerCase(),
      });
    }
    if (query.search) {
      qb.andWhere('note.title ILIKE :search', { search: `%${query.search}%` });
    }
    if (query.categoryId !== undefined) {
      qb.andWhere('category.id = :categoryId', { categoryId: query.categoryId });
    }
    qb.orderBy('note.isPinned', 'DESC')
      .addOrderBy('note.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);
    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit };
  }

  // Reading ONE note counts as a view: check it exists, bump the counter,
  // then load it again so the response shows the new number.
  async findOne(id: number): Promise<Note> {
    await this.getNoteOrFail(id);
    await this.notesRepo.increment({ id }, 'views', 1);
    return this.getNoteOrFail(id);
  }

  async update(id: number, dto: UpdateNoteDto): Promise<Note> {
    const note = await this.getNoteOrFail(id);
    if (dto.title !== undefined) note.title = dto.title;
    if (dto.content !== undefined) note.content = dto.content;
    if (dto.isPinned !== undefined) note.isPinned = dto.isPinned;
    if (dto.categoryId !== undefined) {
      note.category = await this.resolveCategory(dto.categoryId);
    }
    if (dto.tags !== undefined) note.tags = await this.resolveTags(dto.tags);
    return this.notesRepo.save(note);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.notesRepo.delete(id);
    if (!result.affected) throw new NotFoundException(`Note ${id} not found`);
    return { deleted: true };
  }
}
