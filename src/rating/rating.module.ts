import { Module } from '@nestjs/common';
import { RatingController } from './rating.controller';
import { RatingService } from './rating.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rating } from 'src/typeorm/entities/rating.entity';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rating])],
  controllers: [RatingController],
  providers: [RatingService, UsersService],
})
export class RatingModule {}
