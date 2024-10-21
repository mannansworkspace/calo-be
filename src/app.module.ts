import { BullModule } from '@nestjs/bullmq';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import bodyParser from 'body-parser';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JobModule } from './modules/job/job.module';

@Module({
  imports: [
    JobModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: +process.env.PORT || 6379,
      },
    }),
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
