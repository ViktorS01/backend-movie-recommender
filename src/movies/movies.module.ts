import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from 'src/typeorm/entities/movies.entity';
import { Rating } from 'src/typeorm/entities/rating.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Movie, Rating])],
  controllers: [MoviesController],
  providers: [MoviesService, UsersService],
})
export class MoviesModule {}
