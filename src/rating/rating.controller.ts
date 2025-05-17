import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { RatingService } from 'src/rating/rating.service';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateRatingDTO } from 'src/rating/dto/rating.dto';
import { Rating } from 'src/typeorm/entities/rating.entity';
import { UsersService } from 'src/users/users.service';

@ApiBearerAuth()
@Controller('rating')
export class RatingController {
  constructor(
    private readonly ratingService: RatingService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  async getAll() {
    return await this.ratingService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('/import')
  async importRatings() {
    await this.ratingService.importRatings();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: number) {
    return await this.ratingService.findOne(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async delete(@Param('id') movieId: number, @Request() req) {
    const user = this.usersService.findOne(req.user.username);
    await this.ratingService.remove(movieId, user!.userId);
  }

  @UseGuards(AuthGuard)
  @Put()
  @ApiOperation({ summary: 'Add or update a rating' })
  @ApiBody({
    type: Rating,
    description: 'Rating data',
    examples: {
      ratingExample: {
        summary: 'Rating Example',
        value: {
          movieId: 1371,
          rating: 4,
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Rating added/updated successfully',
  })
  async addRating(
    @Body()
    rating: CreateRatingDTO,
    @Request() req,
  ) {
    const user = this.usersService.findOne(req.user.username);
    return await this.ratingService.addRating(rating, user!.userId);
  }
}
