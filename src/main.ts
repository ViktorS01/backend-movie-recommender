import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Movie Recommender')
    .setDescription('Movie Recommender API DOC')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      defaultModelsExpandDepth: -1,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  app.enableCors({
    origin: '*',
  });

  await app.listen(process.env.PORT ?? 5001, '0.0.0.0');
}
bootstrap();
