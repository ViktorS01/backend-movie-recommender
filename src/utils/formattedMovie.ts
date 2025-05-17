import { MovieType } from 'src/movies/dto/movies.dto';
import { Movie } from 'src/typeorm/entities/movies.entity';
import { softEval } from 'src/strategies';

export const formattedMovie = (movie: Movie, rating?: number): MovieType => {
  return {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    imageUrl: movie.poster_path,
    genres: softEval(movie.genres, []).map((item) => item?.name),
    releaseYear: Number(movie.release_date.split('-')[0]),
    rating,
    // production_companies: softEval(item.production_companies, []),
    // production_countries: softEval(item.production_countries, []),
  };
};
