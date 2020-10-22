import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import { MaintenanceService } from 'src/app/services/api/maintenance.service';

@Component({
  selector: 'app-activity',
  templateUrl: './activity.component.html',
  styleUrls: ['./activity.component.css']
})
export class ActivityComponent implements OnInit {

  activity$ = this.maintenanceService.activity$
    .pipe(
      map(jobs => jobs.activity),
      catchError(error => of(null)),
    );

  constructor(
    private maintenanceService: MaintenanceService,
  ) { }

  ngOnInit() {
  }

}
