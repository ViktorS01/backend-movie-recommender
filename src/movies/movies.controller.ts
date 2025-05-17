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
import { UsersService } from 'src/users/users.service';

@ApiBearerAuth()
@Controller('movies')
export class MoviesController {
  constructor(
    private readonly movieService: MoviesService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  getAll(@Request() req) {
    const user = this.usersService.findOne(req.user.username);
    return this.movieService.findAll(user!.userId);
  }

  @UseGuards(AuthGuard)
  @Get('/import')
  importMovies(): void {
    this.movieService.importMovies();
  }

  @UseGuards(AuthGuard)
  @Get('/recommendations')
  getRecommendations(@Request() req) {
    const user = this.usersService.findOne(req.user.username);
    return this.movieService.findRecommendations(user!.userId);
  }

  @UseGuards(AuthGuard)
  @Get('/rated')
  getRated(@Request() req) {
    const user = this.usersService.findOne(req.user.username);
    return this.movieService.findRatedMovies(user!.userId);
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
