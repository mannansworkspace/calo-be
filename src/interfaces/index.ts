import { ExperienceLevel, JobStatus, JobType } from 'src/constants';

export interface TimeStamps {
  createdAt: Date;
  deleteAt?: Date;
  updatedAt: Date;
}

export interface JobImageUrls {
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
    small_s3: string;
  } | null;
}

export interface AppJob extends TimeStamps, JobImageUrls {
  id: string;
  title: String;
  description: String;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  status: JobStatus;
}

export interface Generic<K, V> {
  K: V;
}

export type Jobs = Generic<string, AppJob>;
