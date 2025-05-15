import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movie } from 'src/typeorm/entities/movies.entity';
import { MovieType } from 'src/movies/dto/movies.dto';

import * as fs from 'fs';
import * as path from 'path';
import * as csvParse from 'csv-parse';

import {
  init,
  moviesKeywordsPromise,
  moviesMetaDataPromise,
  ratingsPromise,
} from 'src/strategies';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
  ) {}

  async importMovies(): Promise<void> {
    const filePath = path.resolve('src/data/movies_metadata.csv');
    const fileStream = fs.createReadStream(filePath);
    const csvParser = csvParse.parse({
      columns: true,
      delimiter: ',',
      relax_quotes: true,
      relax_column_count: true,
    });
    fileStream.pipe(csvParser);

    for await (const record of csvParser) {
      const movie: Movie = new Movie();

      movie.id = parseInt(record.id);
      movie.adult = record['adult'] === 'True';
      movie.budget = record['budget'];
      movie.homepage = record['homepage'];
      movie.imdb_id = record['imdb_id'];
      movie.original_language = record['original_language'];
      movie.original_title = record['original_title'];
      movie.overview = record['overview'];
      movie.release_date = record['release_date'];
      movie.revenue = record['revenue'];
      movie.runtime = record['runtime'];
      movie.popularity = record['popularity'];
      movie.poster_path = record['poster_path'];
      movie.status = record['status'];
      movie.tagline = record['tagline'];
      movie.title = record['title'];
      movie.video = record['video'] === 'True';
      movie.vote_average = record['vote_average'];
      movie.vote_count = record['vote_count'];
      movie.production_companies = record['production_companies'];
      movie.belongs_to_collection = record['belongs_to_collection'];
      movie.genres = record['genres'];
      movie.production_countries = record['production_countries'];

      await this.moviesRepository.save(movie);
    }
    console.log('Movies imported successfully!');
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: MovieType[]; total: number }> {
    const [data, total] = await this.moviesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
  async findOne(id: number): Promise<MovieType | null> {
    return await this.moviesRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.moviesRepository.delete(id);
  }

  async findRecommendations(): Promise<MovieType[]> {
    Promise.all([
      moviesMetaDataPromise,
      moviesKeywordsPromise,
      ratingsPromise,
    ]).then(init);

    return await this.moviesRepository.findBy({ id: 2 });
  }
}
