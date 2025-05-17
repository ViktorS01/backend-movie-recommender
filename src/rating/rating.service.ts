import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from 'src/typeorm/entities/rating.entity';
import { CreateRatingDTO } from 'src/rating/dto/rating.dto';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  async importRatings(): Promise<void> {
    const filePath = path.resolve('src/data/ratings_small.csv');
    const fileStream = fs.createReadStream(filePath);
    const csvParser = parse({
      columns: true,
      delimiter: ',',
      relax_quotes: true,
      relax_column_count: true,
    });
    fileStream.pipe(csvParser);

    for await (const record of csvParser) {
      const rating = new Rating();
      rating.userId = parseInt(record.userId, 10);
      rating.movieId = parseInt(record.movieId, 10);
      rating.rating = parseFloat(record.rating);
      rating.timestamp = parseInt(record.timestamp, 10);

      await this.ratingsRepository.save(rating);
    }
    console.log('Ratings imported successfully!');
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Rating[]; total: number }> {
    const [data, total] = await this.ratingsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
  async findOne(id: number): Promise<Rating | null> {
    return await this.ratingsRepository.findOneBy({ id });
  }

  async remove(movieId: number, userId: number): Promise<void> {
    await this.ratingsRepository.delete({
      movieId: movieId,
      userId: userId,
    });
  }

  async addRating(rating: CreateRatingDTO, userId: number) {
    const existingRating = await this.ratingsRepository.findOne({
      where: {
        userId: userId,
        movieId: rating.movieId,
      },
    });

    if (existingRating) {
      existingRating.rating = rating.rating;
      existingRating.timestamp = Math.floor(Date.now() / 1000);
      await this.ratingsRepository.save(existingRating);
    } else {
      const newRating = new Rating();
      newRating.userId = userId;
      newRating.movieId = rating.movieId;
      newRating.rating = rating.rating;
      newRating.timestamp = Math.floor(Date.now() / 1000);
      await this.ratingsRepository.save(newRating);
    }
  }
}
