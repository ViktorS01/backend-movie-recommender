import { Entity, PrimaryColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Keywords extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column('text', { nullable: true })
  keywords: string;
}
