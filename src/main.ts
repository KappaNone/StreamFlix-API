import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { XmlInterceptor } from './common/xml.interceptor';
import * as xmlparser from 'express-xml-bodyparser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
  cors: {
    origin: true,          
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
});
  const config = new DocumentBuilder()
    .setTitle('StreamFlix API')
    .setDescription('StreamFlix API docs')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  app.useGlobalPipes(new ValidationPipe());

  // Enable XML body parsing
  app.use(xmlparser());

  // Enable XML response transformation
  app.useGlobalInterceptors(new XmlInterceptor());

  app.enableShutdownHooks();

  await app.listen(3000);
}
bootstrap();
