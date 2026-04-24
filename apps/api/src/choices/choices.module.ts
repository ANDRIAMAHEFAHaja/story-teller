import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Choice } from '../entities/choice.entity';
import { Page } from '../entities/page.entity';
import { ChoicesController } from './choices.controller';
import { ChoicesService } from './choices.service';
import { PageChoicesController } from './page-choices.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Choice, Page])],
  controllers: [PageChoicesController, ChoicesController],
  providers: [ChoicesService],
  exports: [ChoicesService],
})
export class ChoicesModule {}
