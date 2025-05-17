import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rating } from 'src/typeorm/entities/rating.entity';
import { User } from 'src/users/dto/users.dto';

type Profile = {
  id: number;
  username: string;
  tag: string;
  rating: {
    quantity: number;
    average: number;
  };
};

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Rating)
    private ratingsRepository: Repository<Rating>,
  ) {}

  async findProfile(user: User): Promise<Profile> {
    const userRatings = await this.ratingsRepository.find({
      where: {
        userId: user.userId,
      },
    });

    const sum = userRatings.reduce((acc, value) => acc + value.rating, 0) || 0;
    const quantity = userRatings.length;

    const average = sum / quantity;

    return {
      id: user.userId,
      username: user.username,
      tag: user.tag,
      rating: {
        quantity: userRatings.length,
        average,
      },
    };
  }
}
