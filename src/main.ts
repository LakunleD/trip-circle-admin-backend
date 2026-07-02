import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const origins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map((o) => o.trim())
    : '*';

  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('TripCircle Admin API')
    .setDescription('Beta Dashboard & Bug Tracker — Internal Use Only')
    .setVersion('1.0')
    .addTag('Auth', 'Google OAuth login and team access management')
    .addTag('Beta Testers', 'Manage beta tester records and wave assignments')
    .addTag('Beta Waves', 'Manage wave capacity and status')
    .addTag('Bugs', 'Bug reporting, triage, and lifecycle management')
    .addTag('Feedback', 'In-app tester feedback submissions')
    .addTag('Surveys', 'Onboarding, mid-beta, and closing survey responses')
    .addTag('Content Bank', 'Approved tester quotes for marketing use')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`TripCircle admin backend running on port ${port}`);
  console.log(`API base URL:   http://localhost:${port}/api`);
  console.log(`Swagger docs:   http://localhost:${port}/api/docs`);
}

bootstrap();