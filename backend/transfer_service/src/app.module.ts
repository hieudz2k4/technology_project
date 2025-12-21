import { Module } from '@nestjs/common';
import { TransferModule } from './module/transfer/transfer.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { OpenTelemetryModule } from 'nestjs-otel';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    OpenTelemetryModule.forRoot({
      metrics: {
        hostMetrics: true,

      },
    }),
    PrometheusModule.register(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventEmitterModule.forRoot(),
    TransferModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
