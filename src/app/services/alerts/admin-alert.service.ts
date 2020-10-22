import { Injectable } from '@angular/core';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service'

@Injectable({
  providedIn: 'root'
})
export class AdminAlertService {
  static replacementKey = 'admin';

  constructor(
    private userAlertService: UserAlertService,
  ) { }

  public postAccessGrantedSuccessAlert(userEmail: string) {
      this.userAlertService.postAlert({
        alertType: UserAlertType.info,
        header: 'Access Granted',
        body: `Account access granted for ${userEmail}.`,
        autoCloseSeconds: 2
      });
  }

  public postAccessRevokedSuccessAlert(userEmail: string) {
      this.userAlertService.postAlert({
        alertType: UserAlertType.info,
        header: 'Access Revoked',
        body: `Account access revoked for ${userEmail}.`,
        autoCloseSeconds: 2
      });
  }

  public postAccessUpdateFailureAlert(userEmail: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Action Failed',
      body: `Unable to update access for ${userEmail}`,
      autoCloseSeconds: 2
    });
  }

  public postInvitationSendSuccessAlert(userEmail: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.info,
      header: 'Invitation Sent',
      body: `An invitation email has been sent to ${userEmail}`,
      autoCloseSeconds: 4
    });
  }

  public postInvitationSendFailureAlert(userEmail: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Invitation Failed',
      body: `There was a problem sending an invitation to ${userEmail}`,
      autoCloseSeconds: 4
    });
  }

  public postInvitationLinkCopiedAlert(userEmail: string) {
    this.userAlertService.postAlert({
      alertType: UserAlertType.info,
      header: 'Invitation Link Copied',
      body: `Unique invitation link copied to clipboard for ${userEmail}`,
      autoCloseSeconds: 2
    });
  }
}
