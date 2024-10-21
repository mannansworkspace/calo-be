import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AppJob, Jobs } from 'src/interfaces';
import { AppQeues, JobStatus, JobType } from 'src/constants';
import { readFileSync } from 'fs';
import { CreateJobDto } from './dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { JobsConsumer } from './job.consumer';
import { Response, Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class JobService {
  private readonly jobsFilePath = __dirname + '/../../store/jobs.json';

  constructor(
    @InjectQueue(AppQeues.JobQueue) private jobsQueue: Queue,
    private jobsConsumer: JobsConsumer,
  ) {}

  addJobToStore(newJob: AppJob) {
    this.jobsConsumer.writeDataToStore(newJob);
  }

  async initStream(res: Response, req: Request) {
    const observable = this.jobsConsumer.getJobObservable();

    const subscription = observable.subscribe({
      next: (data) => {
        // Send the data to the client
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      },
      error: (err) => {
        console.error('Stream error:', err);
        res.write(
          `data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`,
        );
      },
      complete: () => {
        res.end();
      },
    });

    // Cleanup when the connection closes
    req.on('close', () => {
      subscription.unsubscribe();
    });

    return observable;
  }

  async createJob(job: CreateJobDto) {
    try {
      const id = uuidv4();
      const initiatingDate = new Date();
      const newJob: AppJob = {
        ...job,
        createdAt: initiatingDate,
        updatedAt: initiatingDate,
        id,
        status: JobStatus.Pending,
        urls: null,
      };
      this.jobsQueue.add('process-job', newJob);
      this.addJobToStore(newJob);
      return newJob;
    } catch (error) {
      throw new InternalServerErrorException('Error while scheduling Jobs');
    }
  }

  getAllJobs() {
    const data = JSON.parse(readFileSync(this.jobsFilePath, 'utf8')) as Jobs;
    return data;
  }
}
