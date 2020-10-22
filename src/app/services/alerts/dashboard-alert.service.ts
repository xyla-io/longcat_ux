import { Injectable } from '@angular/core';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardAlertService {
  static replacementKey = 'dashboard';

  constructor(
    private userAlertService: UserAlertService,
  ) { }

  postDataRetrievalError() {
    this.userAlertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Error',
      body: `There was a problem loading the data for this dashboard`,
      replacementKey: DashboardAlertService.replacementKey,
      autoCloseSeconds: 0,
    });
  }

}
