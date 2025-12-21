import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

import { otelSDK } from './tracing';

async function bootstrap() {
  await otelSDK.start();
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'transfer',
      protoPath: join(__dirname, 'proto/transfer.proto'),
      url: '0.0.0.0:50052',
    },
  });

  await app.startAllMicroservices();
  await app.listen(8083);
}

bootstrap();
