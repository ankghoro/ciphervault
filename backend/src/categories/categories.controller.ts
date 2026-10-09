import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly service: CategoriesService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('deleted') deleted?: string,
  ) {
    return this.service.findAll(user.id, deleted === 'true');
  }

  @Post(':id/restore')
  restore(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.restore(user.id, id);
  }

  @Delete(':id/purge')
  purge(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.purge(user.id, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.findOne(user.id, id);
  }

  @Post()
  create(
    @CurrentUser() user: { id: string },
    @Body() dto: CreateCategoryDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  /** Soft delete — sets deletedAt only */
  @Delete(':id')
  softDelete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.softDelete(user.id, id);
  }
}
