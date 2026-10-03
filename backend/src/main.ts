import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  const port = process.env.PORT ?? 3000;
  const baseUrl = `http://localhost:${port}`;

  const options = new DocumentBuilder()
    .setTitle('Madeireira API')
    .setDescription('API de gestão da madeireira')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document, { customSiteTitle: 'Madeireira API docs' });

  await app.listen(port, () => {
    Logger.log(`Servidor rodando em: ${baseUrl}`);
    Logger.log(`Swagger docs em: ${baseUrl}/docs`);
  });
}

bootstrap();
