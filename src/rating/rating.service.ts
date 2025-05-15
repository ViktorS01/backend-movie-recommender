import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from 'src/typeorm/entities/rating.entity';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

@Injectable()
export class RatingService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

  async remove(id: number): Promise<void> {
    await this.ratingsRepository.delete(id);
  }
}
