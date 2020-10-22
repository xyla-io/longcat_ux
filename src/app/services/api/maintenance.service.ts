import { Injectable } from '@angular/core';

import { tap, catchError } from 'rxjs/operators';

import {
  APIService,
  APIResponse,
} from 'src/app/services/api/api.service';

export interface Job {
  target: string;
  action: string;
  company: string;
  result: number|string;
  realm: string;
  configuration: any;
}

export interface JobResponse extends APIResponse {
  job: Job;
}

export interface JobScore {
  name: string;
  score: string;
}

export interface MicraJobsResponse extends APIResponse {
  active_jobs: string[];
  ready_jobs: string[];
  almacen_ready_jobs: JobScore[];
  longcat_api_requests: any;
  longcat_api_requests_to_score: any;
  longcat_api_scoring_hopper: any;
}

export interface ActivityResponse extends APIResponse {
  activity: ActivityTable[];
}

export interface ActivityTable {
  schema: any;
  data: any;
  identifier: string;
}

@Injectable({
  providedIn: 'root'
})
export class MaintenanceService {

  private static readonly baseURL = APIService.baseURL + '/maintenance';
  private static readonly micraJobsURL = MaintenanceService.baseURL + '/micra-jobs';
  private static readonly activityURL = MaintenanceService.baseURL + '/activity';

  micraJobs$ = this.api.client.get<MicraJobsResponse>(MaintenanceService.micraJobsURL)
    .pipe(
      tap(console.log)
    );

  activity$ = this.api.client.get<ActivityResponse>(MaintenanceService.activityURL)
    .pipe(
      tap(console.log)
    );

  constructor(
    private api: APIService,
  ) { }

  getMicraJobInfo(jobName): Promise<Job> {
    return this.api.client.get<JobResponse>(`${MaintenanceService.micraJobsURL}/${jobName}`)
      .toPromise()
      .then(response => response.job as Job);
  }
}
