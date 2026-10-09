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
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query('tree') tree?: string,
    @Query('deleted') deleted?: string,
  ) {
    if (tree === 'true') {
      return this.service.findTree(user.id);
    }
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
    @Body() dto: CreateGroupDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateGroupDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  /** Soft delete — sets deletedAt only */
  @Delete(':id')
  softDelete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.softDelete(user.id, id);
  }
}
