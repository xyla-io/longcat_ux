import { Injectable } from '@angular/core';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service'

@Injectable({
  providedIn: 'root'
})
export class TaggingAlertService {
  static replacementKey = 'tagging';

  constructor(
    private userAlertService: UserAlertService,
  ) { }

  postTaggingTableInvalidSchemaAlert(pluralEntityName: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.warning,
      header: `No ${pluralEntityName} Found`,
      body: `Metadata is not configured for your company`,
      autoCloseSeconds: 5,
      replacementKey: TaggingAlertService.replacementKey,
    });
  }

  postTaggingTableFailureAlert() {
    this.userAlertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Server Error',
      body: `Unable to retrieve metadata entries`,
      autoCloseSeconds: 5,
      replacementKey: TaggingAlertService.replacementKey,
    });
  }
}
