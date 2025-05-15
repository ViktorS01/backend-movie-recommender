import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { MoviesService } from './movies.service';

@ApiBearerAuth()
@Controller('movies')
export class MoviesController {
  constructor(private readonly movieService: MoviesService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAll(@Param('page') page: number, @Param('limit') limit: number) {
    return this.movieService.findAll(page, limit);
  }

  @UseGuards(AuthGuard)
  @Get('/import')
  importMovies(): void {
    this.movieService.importMovies();
  }

  @UseGuards(AuthGuard)
  @Get('/recommendations')
  getRecommendations() {
    return this.movieService.findRecommendations();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.movieService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number): void {
    this.movieService.remove(id);
  }
}
