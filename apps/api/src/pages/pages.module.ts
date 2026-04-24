import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page } from '../entities/page.entity';
import { Story } from '../entities/story.entity';
import { PagesController } from './pages.controller';
import { PagesService } from './pages.service';
import { StoryPagesController } from './story-pages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Story])],
  controllers: [PagesController, StoryPagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
