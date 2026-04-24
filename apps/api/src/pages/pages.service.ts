import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { pageWithChoices } from '../common/page-response';
import { Page } from '../entities/page.entity';
import { Story } from '../entities/story.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pagesRepo: Repository<Page>,
    @InjectRepository(Story)
    private readonly storiesRepo: Repository<Story>,
  ) {}

  async listForAuthor(storyId: string, userId: string) {
    await this.assertStoryAuthor(storyId, userId);
    const pages = await this.pagesRepo.find({
      where: { storyId },
      order: { createdAt: 'ASC' },
      relations: ['choices'],
    });
    return pages.map((p) => pageWithChoices(p));
  }

  async create(storyId: string, userId: string, dto: CreatePageDto) {
    await this.assertStoryAuthor(storyId, userId);
    const existingCount = await this.pagesRepo.count({ where: { storyId } });
    const wantsStart = dto.isStart ?? existingCount === 0;
    if (wantsStart) {
      await this.pagesRepo.update({ storyId }, { isStart: false });
    }
    const page = this.pagesRepo.create({
      storyId,
      content: dto.content,
      isStart: wantsStart,
    });
    const saved = await this.pagesRepo.save(page);
    const full = await this.pagesRepo.findOne({
      where: { id: saved.id },
      relations: ['choices'],
    });
    return pageWithChoices(full!);
  }

  async getPublic(id: string) {
    const page = await this.pagesRepo.findOne({
      where: { id },
      relations: ['choices'],
    });
    if (!page) {
      throw new NotFoundException('Page introuvable');
    }
    return pageWithChoices(page);
  }

  async update(pageId: string, userId: string, dto: UpdatePageDto) {
    const page = await this.loadPageForAuthor(pageId, userId);
    if (dto.content !== undefined) {
      page.content = dto.content;
    }
    if (dto.isStart === true) {
      await this.pagesRepo.update({ storyId: page.storyId }, { isStart: false });
      page.isStart = true;
    } else if (dto.isStart === false) {
      page.isStart = false;
    }
    await this.pagesRepo.save(page);
    const full = await this.pagesRepo.findOne({
      where: { id: page.id },
      relations: ['choices'],
    });
    return pageWithChoices(full!);
  }

  async remove(pageId: string, userId: string) {
    const page = await this.loadPageForAuthor(pageId, userId);
    await this.pagesRepo.remove(page);
    return { deleted: true };
  }

  private async assertStoryAuthor(storyId: string, userId: string) {
    const story = await this.storiesRepo.findOne({ where: { id: storyId } });
    if (!story) {
      throw new NotFoundException('Histoire introuvable');
    }
    if (story.authorId !== userId) {
      throw new ForbiddenException();
    }
    return story;
  }

  private async loadPageForAuthor(pageId: string, userId: string) {
    const page = await this.pagesRepo.findOne({
      where: { id: pageId },
      relations: ['story'],
    });
    if (!page) {
      throw new NotFoundException('Page introuvable');
    }
    if (page.story.authorId !== userId) {
      throw new ForbiddenException();
    }
    return page;
  }
}
