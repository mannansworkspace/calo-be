import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AppQeues } from 'src/constants';
import { JobsConsumer } from './job.consumer';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: AppQeues.JobQueue,
    }),
    HttpModule,
  ],
  controllers: [JobController],
  providers: [JobService, JobsConsumer],
})
export class JobModule {}
