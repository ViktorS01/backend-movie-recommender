import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Movie Recommender')
    .setDescription('Movie Recommender API DOC')
    .setVersion('1.0')
    .addTag('MovieRecommender')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: ['http://localhost:5000'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
