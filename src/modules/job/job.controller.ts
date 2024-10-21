import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import { CreateJobDto } from './dto';
import { JobService } from './job.service';
import { Response, Request } from 'express';

@Controller('jobs')
export class JobController {
  constructor(private jobService: JobService) {}

  // @Get('stream')
  @Sse('stream')
  initStream(@Res() res: Response, @Req() req: Request) {
    return this.jobService.initStream(res, req);
  }

  @Post()
  createJob(@Body() jobData: CreateJobDto) {
    const job = this.jobService.createJob(jobData);
    return {
      success: true,
      job,
    };
  }

  @Get()
  getAllJobs() {
    const jobs = this.jobService.getAllJobs();
    return {
      success: true,
      jobs,
    };
  }
}
