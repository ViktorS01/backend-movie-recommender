import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { RatingService } from 'src/rating/rating.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UseGuards(AuthGuard)
  @Get()
  getAll(@Param('page') page: number, @Param('limit') limit: number) {
    return this.ratingService.findAll(page, limit);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  getOne(@Param('id') id: number) {
    return this.ratingService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  delete(@Param('id') id: number): void {
    this.ratingService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Get('/import')
  importRatings(): void {
    console.log(123);
    this.ratingService.importRatings();
  }
}
