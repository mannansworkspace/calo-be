import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

const PORT = 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT);

  const config = new DocumentBuilder()
    .setTitle('Calo Challenge')
    .setDescription('This is API documentation for Calo Challenge')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  Logger.log(`Server is listening at port ${PORT}`);
}
bootstrap();
