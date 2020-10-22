import { Component, OnInit } from '@angular/core';
import { UserAlert, UserAlertType, UserAlertService } from 'src/app/services/alerts/user-alert.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
  static defaultAlertDismissSeconds = 8;

  activeAlerts: Set<UserAlert> = new Set();
  replacementMap: { [x: string]: UserAlert } = {};

  constructor(
    private userAlertService: UserAlertService,
  ) { }

  ngOnInit() {
    this.userAlertService.getAlert().subscribe(userAlert => {
      this.showAlert(userAlert);
    });
  }

  clickClose(userAlert: UserAlert) {
    this.dismissAlert(userAlert);
  }

  private showAlert(userAlert: UserAlert) {
    if (!userAlert) { return; }
    this.activeAlerts.add(userAlert);
    if (userAlert.replacementKey) {
      this.dismissAlert(this.replacementMap[userAlert.replacementKey]);
      this.replacementMap[userAlert.replacementKey] = userAlert;
    }
    if (userAlert.autoCloseSeconds !== 0) {
      setTimeout(() => {
        this.dismissAlert(userAlert);
      }, (userAlert.autoCloseSeconds || AlertComponent.defaultAlertDismissSeconds) * 1000);
    }
  }

  private dismissAlert(userAlert: UserAlert) {
    if (!userAlert) { return; }
    if (userAlert.replacementKey) {
      const previous = this.replacementMap[userAlert.replacementKey];
      if (previous) { this.activeAlerts.delete(previous); }
      delete this.replacementMap[userAlert.replacementKey];
    }
    this.activeAlerts.delete(userAlert);
  }
}
