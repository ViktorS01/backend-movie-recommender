import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, In, MoreThan, Repository } from 'typeorm';

import { Movie } from 'src/typeorm/entities/movies.entity';
import { Rating } from 'src/typeorm/entities/rating.entity';
import { MovieType } from 'src/movies/dto/movies.dto';

import * as fs from 'fs';
import * as path from 'path';
import * as csvParse from 'csv-parse';

import {
  init,
  moviesKeywordsPromise,
  moviesMetaDataPromise,
} from 'src/strategies';
import { formattedMovie } from 'src/utils/formattedMovie';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private moviesRepository: Repository<Movie>,
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  // Вспомогательный метод для перемешивания массива
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

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

  async findAll(idUser, search): Promise<MovieType[]> {
    const whereCondition = search ? { title: ILike(`%${search}%`) } : {};

    const movies = await this.moviesRepository.find({ where: whereCondition });

    const userRatings = await this.ratingsRepository.find({
      where: {
        userId: idUser,
      },
    });

    return movies.map((movie) =>
      formattedMovie(
        movie,
        userRatings.find((rating) => rating.movieId === movie.id)?.rating,
      ),
    );
  }
  async findOne(id: number): Promise<MovieType | null> {
    const movie = await this.moviesRepository.findOneBy({ id });
    return movie ? formattedMovie(movie) : null;
  }

  async remove(id: number): Promise<void> {
    await this.moviesRepository.delete(id);
  }

  async findRecommendations(idUser: number) {
    const userRatings = await this.ratingsRepository.find({
      where: {
        userId: idUser,
      },
    });

    if (!userRatings.length) {
      const popularMovies = await this.moviesRepository.find({
        where: [
          {
            vote_average: MoreThan('8'),
            vote_count: MoreThan('1000'),
          },
        ],
        order: {
          popularity: 'DESC',
          release_date: 'DESC',
        },
      });

      const shuffledMovies = this.shuffleArray(popularMovies);
      return shuffledMovies.slice(0, 20).map((movie) => formattedMovie(movie));
    }

    const ratingsPromise = new Promise((resolve) => {
      const res = this.ratingsRepository.find().then((ratings) =>
        ratings.map((item) => {
          return {
            userId: String(item.userId),
            movieId: String(item.movieId),
            rating: String(item.rating),
            timestamp: String(item.timestamp),
          };
        }),
      );
      resolve(res);
    });

    const [moviesMetaData, moviesKeywords, ratings] = await Promise.all([
      moviesMetaDataPromise,
      moviesKeywordsPromise,
      ratingsPromise,
    ]);

    const lastRatedGoodMovieId =
      Array.isArray(ratings) &&
      ratings
        .filter(
          (item) => item.userId === String(idUser) && Number(item.rating) >= 3,
        )
        .sort((a, b) => a.timestamp - b.timestamp)[0].movieId;

    const lastRatedGoodMovieTitle = lastRatedGoodMovieId
      ? moviesMetaData[String(lastRatedGoodMovieId)]?.title
      : undefined;

    const recommendedMovieIds = init([
      moviesMetaData,
      moviesKeywords,
      ratings,
      idUser,
      lastRatedGoodMovieTitle,
    ]);

    const recommendedMovies = await this.moviesRepository.find({
      where: {
        id: In(recommendedMovieIds),
      },
    });

    const filtersMovie = recommendedMovies.filter(
      (movie) => !userRatings.find((rating) => rating.movieId === movie.id),
    );

    return filtersMovie.map((movie) => formattedMovie(movie));
  }

  async findRatedMovies(idUser: number): Promise<MovieType[]> {
    const userRatings = await this.ratingsRepository.find({
      where: {
        userId: idUser,
      },
    });

    const movieIds = userRatings.map((rating) => rating.movieId);

    const movies = await this.moviesRepository.find({
      where: {
        id: In(movieIds),
      },
    });

    return movies.map((movie) => {
      return formattedMovie(
        movie,
        userRatings.find((rating) => rating.movieId === movie.id)?.rating,
      );
    });
  }
}
