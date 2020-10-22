import { Component, OnInit } from '@angular/core';
import { SessionService } from 'src/app/services/api/session.service';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { UserService } from 'src/app/services/api/user.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  sendResetLinkIsEnabled: boolean = false;
  waitingForResponse: boolean = false;
  submissionErrors: string[] = [];
  submissionResults: string[] = [];
  submitLabel: string = 'Send';

  constructor(
    private errorService: ErrorService,
    private userService: UserService,
    private sessionService: SessionService,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    let email = this.activatedRoute.snapshot.queryParams.email;
    if (email) { this.email = email; }
    this.sendResetLinkIsEnabled = true;
  }

  onSendResetLinkClicked() {
    this.submissionErrors = [];
    this.submissionResults = [];
    this.sendResetLinkIsEnabled = false;
    this.waitingForResponse = true;

    this.userService.forgotPassword(this.email)
    .then(response => {
      this.waitingForResponse = false;
      if (response.message.includes('not on file')) {
        this.submissionErrors = [response.message];
      } else if (response.message.includes('email has been sent')) {
        this.submissionResults = [response.message];
        this.submitLabel = 'Resend';
      } else {
        this.submissionResults = [response.message];
      }
      this.sendResetLinkIsEnabled = true;
    })
    .catch(error => {
      this.waitingForResponse = false;
      let displayErrors = this.errorService.getDisplayableErrors(error);
      if (displayErrors !== null) {
        this.submissionErrors = displayErrors;
      } else {
        this.errorService.presentError(error);
      }
      this.sendResetLinkIsEnabled = true;
    });
  }
}
