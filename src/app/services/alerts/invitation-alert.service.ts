import { Injectable } from '@angular/core';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service'

@Injectable({
  providedIn: 'root'
})
export class InvitationAlertService {
  static replacementKey = 'invitation';

  constructor(
    private userAlertService: UserAlertService,
  ) { }

  postSuccessAlert() {
    this.userAlertService.postAlert({
      alertType: UserAlertType.success,
      header: 'Welcome!',
      body: `You have accepted your invitation.`,
      replacementKey: InvitationAlertService.replacementKey,
    });
  }

  postFailureAlert() {
    this.userAlertService.postAlert({
      alertType: UserAlertType.error,
      header: 'Invitation Invalid',
      body: `The invitation was unable to be completed.`,
      autoCloseSeconds: 0,
      replacementKey: InvitationAlertService.replacementKey,
    });
  }

  postSignUpAlert() {
    this.userAlertService.postAlert({
      alertType: UserAlertType.info,
      header: 'Invitation',
      body: `Sign up or Sign in to accept your invitation`,
      autoCloseSeconds: 0,
      replacementKey: InvitationAlertService.replacementKey,
      icon: 'envelope open outline'
    });
  }
}
