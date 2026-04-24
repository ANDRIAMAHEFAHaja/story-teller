import {
  Body,
  Controller,
  Delete,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtUser } from '../auth/jwt.strategy';
import { ChoicesService } from './choices.service';
import { UpdateChoiceDto } from './dto/update-choice.dto';

@Controller('choices')
@UseGuards(JwtAuthGuard)
export class ChoicesController {
  constructor(private readonly choices: ChoicesService) {}

  @Patch(':id')
  update(
    @CurrentUser() user: JwtUser,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateChoiceDto,
  ) {
    return this.choices.update(id, user.id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: JwtUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.choices.remove(id, user.id);
  }
}
