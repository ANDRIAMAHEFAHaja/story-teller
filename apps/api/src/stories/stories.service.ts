import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../entities/page.entity';
import { Story } from '../entities/story.entity';
import { pageWithChoices } from '../common/page-response';
import { CreateStoryDto } from './dto/create-story.dto';
import { UpdateStoryDto } from './dto/update-story.dto';

@Injectable()
export class StoriesService {
  constructor(
    @InjectRepository(Story)
    private readonly storiesRepo: Repository<Story>,
    @InjectRepository(Page)
    private readonly pagesRepo: Repository<Page>,
  ) {}

  findAll(): Promise<Story[]> {
    return this.storiesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Story> {
    const story = await this.storiesRepo.findOne({ where: { id } });
    if (!story) {
      throw new NotFoundException('Histoire introuvable');
    }
    return story;
  }

  async getStartPage(storyId: string) {
    await this.findOne(storyId);
    const page = await this.pagesRepo.findOne({
      where: { storyId, isStart: true },
      relations: ['choices'],
    });
    if (!page) {
      throw new NotFoundException('Aucune page de départ définie');
    }
    return pageWithChoices(page);
  }

  create(authorId: string, dto: CreateStoryDto): Promise<Story> {
    const story = this.storiesRepo.create({
      title: dto.title,
      description: dto.description ?? null,
      authorId,
    });
    return this.storiesRepo.save(story);
  }

  async update(id: string, authorId: string, dto: UpdateStoryDto) {
    const story = await this.findOne(id);
    if (story.authorId !== authorId) {
      throw new ForbiddenException();
    }
    if (dto.title !== undefined) story.title = dto.title;
    if (dto.description !== undefined) story.description = dto.description;
    return this.storiesRepo.save(story);
  }

  async remove(id: string, authorId: string) {
    const story = await this.findOne(id);
    if (story.authorId !== authorId) {
      throw new ForbiddenException();
    }
    await this.storiesRepo.remove(story);
    return { deleted: true };
  }
}
