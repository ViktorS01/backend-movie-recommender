import { Module } from '@nestjs/common';
import { KeywordsController } from './keywords.controller';
import { KeywordsService } from './keywords.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keywords } from 'src/typeorm/entities/keywords.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Keywords])],
  controllers: [KeywordsController],
  providers: [KeywordsService],
})
export class KeywordsModule {}
