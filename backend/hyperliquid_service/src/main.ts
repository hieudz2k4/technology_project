import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const corsOrigin = configService.get<string>('CORS_ORIGIN');

  app.enableCors({
    origin: corsOrigin ? corsOrigin.split(',') : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const port = configService.get<number>('PORT') || 3005;
  await app.listen(port);
  console.log(`Application is running on: await app.getUrl()`);
}
void bootstrap();
