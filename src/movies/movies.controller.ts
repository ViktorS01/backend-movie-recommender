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
import { MovieType } from 'src/movies/dto/movies.dto';

@ApiBearerAuth()
@Controller('movies')
export class MoviesController {
  constructor(
    private readonly movieService: MoviesService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAll(@Request() req) {
    const user = this.usersService.findOne(req.user.username);
    return await this.movieService.findAll(user!.userId);
  }

  @UseGuards(AuthGuard)
  @Get('/import')
  importMovies(): void {
    this.movieService.importMovies();
  }

  @UseGuards(AuthGuard)
  @Get('/recommendations')
  async getRecommendations(@Request() req): Promise<Array<MovieType>> {
    const user = this.usersService.findOne(req.user.username);
    return await this.movieService.findRecommendations(user!.userId);
  }

  @UseGuards(AuthGuard)
  @Get('/rated')
  async getRated(@Request() req) {
    const user = this.usersService.findOne(req.user.username);
    return await this.movieService.findRatedMovies(user!.userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.movieService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: number) {
    await this.movieService.remove(id);
  }
}
