import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    // Fastify só libera GET/HEAD/POST por padrão; o front usa PATCH nas edições.
    cors: { methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'] },
  });

  const port = process.env.PORT ?? 3000;
  const baseUrl = `http://localhost:${port}`;

  const options = new DocumentBuilder()
    .setTitle('Madeireira API')
    .setDescription('API de gestão da madeireira')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('docs', app, document, { customSiteTitle: 'Madeireira API docs' });

  // 0.0.0.0: o Fastify escuta só em localhost por padrão, o que não é alcançável de dentro de um container.
  await app.listen(port, '0.0.0.0', () => {
    Logger.log(`Servidor rodando em: ${baseUrl}`);
    Logger.log(`Swagger docs em: ${baseUrl}/docs`);
  });
}

bootstrap();
