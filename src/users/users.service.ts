import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { Profile } from './profile.entity';
import { CreateUserDto } from './create-user.dto';
import { UpdateUserDto } from './update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Profile) private readonly profilesRepo: Repository<Profile>,
  ) {}

  async create(dto: CreateUserDto): Promise<User> {
    if (await this.usersRepo.existsBy({ email: dto.email })) {
      throw new ConflictException(`Email '${dto.email}' is already registered`);
    }
    const user = this.usersRepo.create({
      name: dto.name,
      email: dto.email,
      profile: { bio: dto.bio, phone: dto.phone },
    });
    return this.usersRepo.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepo.find({ relations: { profile: true } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: { profile: true, notes: true },
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (dto.email !== undefined && dto.email !== user.email) {
      if (await this.usersRepo.existsBy({ email: dto.email })) {
        throw new ConflictException(`Email '${dto.email}' is already registered`);
      }
      user.email = dto.email;
    }
    if (dto.name !== undefined) user.name = dto.name;
    if (dto.bio !== undefined || dto.phone !== undefined) {
      if (user.profile) {
        if (dto.bio !== undefined) user.profile.bio = dto.bio;
        if (dto.phone !== undefined) user.profile.phone = dto.phone;
      } else {
        user.profile = this.profilesRepo.create({ bio: dto.bio, phone: dto.phone });
      }
    }
    return this.usersRepo.save(user);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.usersRepo.delete(id);
    if (!result.affected) throw new NotFoundException(`User ${id} not found`);
    return { deleted: true };
  }

  // Task 5: one aggregate query over the user's notes. COUNT/SUM come
  // back from Postgres as strings, so every number is converted.
  async getStats(
    id: number,
  ): Promise<{ userId: number; totalNotes: number; pinnedNotes: number; totalViews: number }> {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    const raw = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoin('user.notes', 'note')
      .select('COUNT(note.id)', 'totalNotes')
      .addSelect('COUNT(*) FILTER (WHERE note."isPinned" = true)', 'pinnedNotes')
      .addSelect('COALESCE(SUM(note.views), 0)', 'totalViews')
      .where('user.id = :id', { id })
      .getRawOne<{ totalNotes: string; pinnedNotes: string; totalViews: string }>();
    return {
      userId: id,
      totalNotes: Number(raw?.totalNotes ?? 0),
      pinnedNotes: Number(raw?.pinnedNotes ?? 0),
      totalViews: Number(raw?.totalViews ?? 0),
    };
  }
}
