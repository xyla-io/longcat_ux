import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';

import { MaintenanceService } from 'src/app/services/api/maintenance.service';

@Component({
  selector: 'app-micra-jobs',
  templateUrl: './micra-jobs.component.html',
  styleUrls: ['./micra-jobs.component.css']
})
export class MicraJobsComponent implements OnInit {

  jobInfo = {};

  micraJobs$ = this.maintenanceService.micraJobs$
    .pipe(
      tap(async (jobs) => {
        if (!jobs.almacen_ready_jobs) { return; }
        jobs.almacen_ready_jobs.forEach(async job => {
          this.jobInfo[job.name] = await this.getJobInfo(job.name);
        });
      }),
      map(jobs => {
        if (jobs.almacen_ready_jobs) {
          jobs.almacen_ready_jobs.sort((a, b) => a.ts > b.ts ? -1 : 1)
        }
        return jobs;
      }),
      catchError(error => {
        return of(null);
      }));

  constructor(
    private maintenanceService: MaintenanceService,
  ) { }

  ngOnInit() {
  }

  async getJobInfo(jobName) {
    return this.maintenanceService.getMicraJobInfo(jobName);
  }

  getJobTasks(jobName) {
    let info = this.jobInfo[jobName];
    if (!info) { return []; }
    return Object.keys(info.configuration[info.company].task_sets)
  }

}
