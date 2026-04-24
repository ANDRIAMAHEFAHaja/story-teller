import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt.strategy';
import { CreatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';

@Controller('stories/:storyId/pages')
@UseGuards(JwtAuthGuard)
export class StoryPagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  list(
    @CurrentUser() user: JwtUser,
    @Param('storyId', ParseUUIDPipe) storyId: string,
  ) {
    return this.pages.listForAuthor(storyId, user.id);
  }

  @Post()
  create(
    @CurrentUser() user: JwtUser,
    @Param('storyId', ParseUUIDPipe) storyId: string,
    @Body() dto: CreatePageDto,
  ) {
    return this.pages.create(storyId, user.id, dto);
  }
}
