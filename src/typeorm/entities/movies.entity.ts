import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Movie extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  adult: boolean;

  @Column('decimal', { nullable: true })
  budget: number;

  @Column('text', { nullable: true })
  production_companies: object[];

  @Column('text', { nullable: true })
  production_countries: object[];

  @Column('text', { nullable: true })
  belongs_to_collection: object;

  @Column('text', { nullable: true })
  genres: object[];

  @Column('text', { nullable: true })
  spoken_languages: object[];

  @Column({ nullable: true })
  homepage: string;

  @Column()
  imdb_id: string;

  @Column()
  original_language: string;

  @Column()
  original_title: string;

  @Column('text', { nullable: true })
  overview: string;

  @Column('text', { nullable: true })
  popularity: string;

  @Column('text', { nullable: true })
  poster_path: string;

  @Column('text', { nullable: true })
  release_date: string;

  @Column('text', { nullable: true })
  revenue: string;

  @Column('text', { nullable: true })
  runtime: string;

  @Column()
  status: string;

  @Column('text', { nullable: true })
  tagline: string;

  @Column()
  title: string;

  @Column()
  video: boolean;

  @Column('text', { nullable: true })
  vote_average: string;

  @Column('text', { nullable: true })
  vote_count: string;
}
