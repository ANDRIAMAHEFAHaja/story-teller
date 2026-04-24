import {
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt.strategy';
import { ChoicesService } from './choices.service';
import { CreateChoiceDto } from './dto/create-choice.dto';

@Controller('pages/:fromPageId/choices')
@UseGuards(JwtAuthGuard)
export class PageChoicesController {
  constructor(private readonly choices: ChoicesService) {}

  @Post()
  create(
    @CurrentUser() user: JwtUser,
    @Param('fromPageId', ParseUUIDPipe) fromPageId: string,
    @Body() dto: CreateChoiceDto,
  ) {
    return this.choices.create(fromPageId, user.id, dto);
  }
}
