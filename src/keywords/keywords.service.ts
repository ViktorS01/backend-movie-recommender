import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Keywords } from 'src/typeorm/entities/keywords.entity';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';

@Injectable()
export class KeywordsService {
  constructor(
    @InjectRepository(Keywords)
    private keywordsRepository: Repository<Keywords>,
  ) {}

  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  async importKeywords(): Promise<void> {
    const filePath = path.resolve('src/data/keywords.csv');
    const fileStream = fs.createReadStream(filePath);
    const csvParser = parse({
      columns: true,
      delimiter: ',',
      relax_quotes: true,
      relax_column_count: true,
    });
    fileStream.pipe(csvParser);

    for await (const record of csvParser) {
      const keywords = new Keywords();
      keywords.id = parseInt(record.id, 10);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      keywords.keywords = record['keywords'];

      await this.keywordsRepository.save(keywords);
    }
    console.log('Keywords imported successfully!');
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: Keywords[]; total: number }> {
    const [data, total] = await this.keywordsRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
  async findOne(id: number): Promise<Keywords | null> {
    return await this.keywordsRepository.findOneBy({ id });
  }

  async remove(id: number): Promise<void> {
    await this.keywordsRepository.delete(id);
  }
}
