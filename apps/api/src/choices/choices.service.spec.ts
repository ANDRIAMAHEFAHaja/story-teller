import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Choice } from '../entities/choice.entity';
import { Page } from '../entities/page.entity';
import { ChoicesService } from './choices.service';

describe('ChoicesService', () => {
  let service: ChoicesService;
  let pagesRepo: jest.Mocked<Pick<Repository<Page>, 'findOne'>>;

  beforeEach(async () => {
    pagesRepo = { findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChoicesService,
        {
          provide: getRepositoryToken(Choice),
          useValue: { create: jest.fn(), save: jest.fn(), findOne: jest.fn() },
        },
        { provide: getRepositoryToken(Page), useValue: pagesRepo },
      ],
    }).compile();

    service = module.get(ChoicesService);
  });

  it('refuse un choix vers une autre histoire', async () => {
    pagesRepo.findOne
      .mockResolvedValueOnce({
        id: 'a',
        storyId: 's1',
        story: { authorId: 'u1' },
      } as Page)
      .mockResolvedValueOnce({
        id: 'b',
        storyId: 's2',
      } as Page);

    await expect(
      service.create('a', 'u1', { label: 'Aller', toPageId: 'b' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
