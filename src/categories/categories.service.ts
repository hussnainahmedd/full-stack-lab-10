import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoriesRepo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    if (await this.categoriesRepo.existsBy({ name: dto.name })) {
      throw new ConflictException(`Category '${dto.name}' already exists`);
    }
    return this.categoriesRepo.save(this.categoriesRepo.create({ name: dto.name }));
  }

  findAll(): Promise<Category[]> {
    return this.categoriesRepo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: { notes: true },
    });
    if (!category) throw new NotFoundException(`Category ${id} not found`);
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    if (dto.name !== undefined && dto.name !== category.name) {
      if (await this.categoriesRepo.existsBy({ name: dto.name })) {
        throw new ConflictException(`Category '${dto.name}' already exists`);
      }
      category.name = dto.name;
    }
    return this.categoriesRepo.save(category);
  }

  async remove(id: number): Promise<{ deleted: boolean }> {
    const result = await this.categoriesRepo.delete(id);
    if (!result.affected) throw new NotFoundException(`Category ${id} not found`);
    return { deleted: true };
  }
}
