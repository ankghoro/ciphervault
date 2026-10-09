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
import { CredentialsService } from './credentials.service';
import { CreateCredentialDto } from './dto/create-credential.dto';
import { UpdateCredentialDto } from './dto/update-credential.dto';
import { QueryCredentialsDto } from './dto/query-credentials.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('credentials')
@UseGuards(JwtAuthGuard)
export class CredentialsController {
  constructor(private readonly service: CredentialsService) {}

  @Get()
  findAll(
    @CurrentUser() user: { id: string },
    @Query() query: QueryCredentialsDto,
  ) {
    return this.service.findAll(user.id, query);
  }

  @Get('metrics')
  metrics(@CurrentUser() user: { id: string }) {
    return this.service.metrics(user.id);
  }

  // Static/nested paths MUST be registered before :id
  @Get(':id/reveal')
  reveal(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.revealPassword(user.id, id);
  }

  @Post(':id/restore')
  restore(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.restore(user.id, id);
  }

  /** Permanent delete — only for items already in trash */
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
    @Body() dto: CreateCredentialDto,
  ) {
    return this.service.create(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateCredentialDto,
  ) {
    return this.service.update(user.id, id, dto);
  }

  /**
   * Soft delete only — sets deletedAt, does NOT remove the row.
   * Data remains in DB and appears in Trash.
   */
  @Delete(':id')
  softDelete(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.service.softDelete(user.id, id);
  }
}
