import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { InternalServerErrorException } from '@nestjs/common';
import { Job } from 'bullmq';
import { Subject } from 'rxjs';
import { AppQeues, JobStatus } from 'src/constants';
import { AppJob, Jobs } from 'src/interfaces';
import { readFileSync, writeFileSync } from 'fs';
import { HttpService } from '@nestjs/axios';

@Processor(AppQeues.JobQueue, { concurrency: 1 })
export class JobsConsumer extends WorkerHost {
  private jobStatusSubject = new Subject<any>();
  private readonly jobsFilePath = __dirname + '/../../store/jobs.json';
  private readonly httpService: HttpService = new HttpService();

  async process(job: Job<AppJob>): Promise<any> {
    try {
      const unsplashUrl = 'https://api.unsplash.com/photos/random?query=food';
      const response = await this.httpService.axiosRef.get(unsplashUrl, {
        headers: {
          Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
        },
      });
      job.data.urls = response.data.urls;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve('Completed');
        }, 8000);
      });
    } catch (error) {
      console.log({ error });
      throw new InternalServerErrorException('Error while processing Job');
    }
  }

  // TODO This could be an independent module
  readDataFromStore(): Jobs {
    return JSON.parse(readFileSync(this.jobsFilePath, 'utf-8'));
  }

  writeDataToStore(newJob: AppJob) {
    const data = this.readDataFromStore();
    data[newJob.id] = newJob;
    writeFileSync(this.jobsFilePath, JSON.stringify(data));
  }

  getJobObservable() {
    return this.jobStatusSubject.asObservable();
  }

  pushMessageToChannel(message: string, job: AppJob) {
    this.jobStatusSubject.next(
      JSON.stringify({
        message,
        type: 'mutation',
        job,
      }),
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job<AppJob>) {
    const newJob: AppJob = {
      ...job.data,
      updatedAt: new Date(),
      status: JobStatus.Processing,
    };
    job.data = newJob;

    this.writeDataToStore(newJob);

    this.pushMessageToChannel(
      `Job ${newJob.id} is activated and Running`,
      newJob,
    );
  }

  @OnWorkerEvent('failed')
  onError(job: Job<AppJob>) {
    const newJob: AppJob = {
      ...job.data,
      updatedAt: new Date(),
      status: JobStatus.Failed,
    };
    job.data = newJob;

    this.writeDataToStore(newJob);

    this.pushMessageToChannel(`Job ${newJob.id} is Failed`, newJob);
  }

  @OnWorkerEvent('completed')
  onComplete(job: Job<AppJob>) {
    const newJob: AppJob = {
      ...job.data,
      updatedAt: new Date(),
      status: JobStatus.Completed,
    };
    job.data = newJob;

    this.writeDataToStore(newJob);

    this.pushMessageToChannel(`Job ${newJob.id} is completed`, newJob);
  }
}
