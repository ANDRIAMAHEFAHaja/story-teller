import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Choice } from '../entities/choice.entity';
import { Page } from '../entities/page.entity';
import { CreateChoiceDto } from './dto/create-choice.dto';
import { UpdateChoiceDto } from './dto/update-choice.dto';

@Injectable()
export class ChoicesService {
  constructor(
    @InjectRepository(Choice)
    private readonly choicesRepo: Repository<Choice>,
    @InjectRepository(Page)
    private readonly pagesRepo: Repository<Page>,
  ) {}

  async create(fromPageId: string, userId: string, dto: CreateChoiceDto) {
    const fromPage = await this.pagesRepo.findOne({
      where: { id: fromPageId },
      relations: ['story'],
    });
    if (!fromPage) {
      throw new NotFoundException('Page introuvable');
    }
    if (fromPage.story.authorId !== userId) {
      throw new ForbiddenException();
    }
    const toPage = await this.pagesRepo.findOne({ where: { id: dto.toPageId } });
    if (!toPage) {
      throw new NotFoundException('Page destination introuvable');
    }
    if (toPage.storyId !== fromPage.storyId) {
      throw new BadRequestException(
        'La page de destination doit appartenir à la même histoire',
      );
    }
    const choice = this.choicesRepo.create({
      fromPageId,
      toPageId: dto.toPageId,
      label: dto.label,
    });
    return this.choicesRepo.save(choice);
  }

  async update(choiceId: string, userId: string, dto: UpdateChoiceDto) {
    const choice = await this.choicesRepo.findOne({
      where: { id: choiceId },
      relations: ['fromPage', 'fromPage.story'],
    });
    if (!choice) {
      throw new NotFoundException('Choix introuvable');
    }
    if (choice.fromPage.story.authorId !== userId) {
      throw new ForbiddenException();
    }
    if (dto.label !== undefined) {
      choice.label = dto.label;
    }
    if (dto.toPageId !== undefined) {
      const toPage = await this.pagesRepo.findOne({
        where: { id: dto.toPageId },
      });
      if (!toPage) {
        throw new NotFoundException('Page destination introuvable');
      }
      if (toPage.storyId !== choice.fromPage.storyId) {
        throw new BadRequestException(
          'La page de destination doit appartenir à la même histoire',
        );
      }
      choice.toPageId = dto.toPageId;
    }
    return this.choicesRepo.save(choice);
  }

  async remove(choiceId: string, userId: string) {
    const choice = await this.choicesRepo.findOne({
      where: { id: choiceId },
      relations: ['fromPage', 'fromPage.story'],
    });
    if (!choice) {
      throw new NotFoundException('Choix introuvable');
    }
    if (choice.fromPage.story.authorId !== userId) {
      throw new ForbiddenException();
    }
    await this.choicesRepo.remove(choice);
    return { deleted: true };
  }
}
