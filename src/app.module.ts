import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from 'src/typeorm/entities/movies.entity';
import { RatingModule } from './rating/rating.module';
import { Rating } from 'src/typeorm/entities/rating.entity';
import { KeywordsModule } from './keywords/keywords.module';
import { Keywords } from 'src/typeorm/entities/keywords.entity';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    MoviesModule,
    RatingModule,
    KeywordsModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root',
      database: 'movie_recommender_db',
      entities: [Movie, Rating, Keywords],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Rating]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
