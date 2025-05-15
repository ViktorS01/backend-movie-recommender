import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { KeywordsService } from 'src/keywords/keywords.service';

@ApiBearerAuth()
@Controller('keywords')
export class KeywordsController {
  constructor(private readonly keywordsService: KeywordsService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAll(@Param('page') page: number, @Param('limit') limit: number) {
    return this.keywordsService.findAll(page, limit);
  }

  @UseGuards(AuthGuard)
  @Get('/import')
  importKeywords(): void {
    this.keywordsService.importKeywords();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.keywordsService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number): void {
    this.keywordsService.remove(id);
  }
}
