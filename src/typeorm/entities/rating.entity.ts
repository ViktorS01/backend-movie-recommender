import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  movieId: number;

  @Column('float')
  rating: number;

  @Column('bigint')
  timestamp: number;
}
