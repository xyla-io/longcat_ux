import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SessionService } from 'src/app/services/api/session.service';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { InvitationAlertService } from 'src/app/services/alerts/invitation-alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  invitationToken: string = undefined;
  email: string = '';
  emailLocked: boolean = false;
  password: string = '';
  signInIsEnabled: boolean = false;
  waitingForResponse: boolean = false;
  submissionErrors: string[] = [];

  private destroyed = new Subject();

  constructor(
    private sessionService: SessionService,
    private errorService: ErrorService,
    private invitationAlertService: InvitationAlertService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) { }

  ngOnInit() {
    if (this.sessionService.currentUser) {
      this.router.navigateByUrl(this.sessionService.redirectUrl);
    }
    this.sessionService.session$
      .pipe(takeUntil(this.destroyed))
      .subscribe(session => {
        if (session) {
          this.router.navigateByUrl(this.sessionService.redirectUrl);
        }
      });

    this.signInIsEnabled = true;
    this.invitationToken = this.activatedRoute.snapshot.queryParams.invitation;
    let email = this.activatedRoute.snapshot.queryParams.email;
    if (email) {
      this.email = email;
      if (this.invitationToken) {
        this.emailLocked = true;
      }
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  inputEmailKeyPress(event: any) {
    if (!this.emailLocked) { return true; }
    if (event.key.toLowerCase() === 'tab') { return true; }
    return false;
  }

  onSignInClicked() {
    this.signInIsEnabled = false;
    this.waitingForResponse = true;
    this.submissionErrors = [];
    this.sessionService.signIn(
      {
        'email': this.email,
        'password': this.password,
      })
      .then(redirectUrl => {
        if (this.invitationToken) {
          this.tryAcceptInvitation(this.invitationToken, redirectUrl);
        } else {
          this.redirectAfterSignIn(redirectUrl);
        }
      })
      .catch(error => {
        this.waitingForResponse = false;
        let displayErrors = this.errorService.getDisplayableErrors(error);
        if (displayErrors !== null) {
          this.submissionErrors = displayErrors;
        } else {
          this.errorService.presentError(error);
        }
        this.signInIsEnabled = true;
      });
  }

  tryAcceptInvitation(token: string, redirectUrl: string) {
    return this.sessionService.acceptInvitation(environment.siteName, token)
      .then(success => {
        this.invitationAlertService.postSuccessAlert();
        this.redirectAfterSignIn(redirectUrl);
      })
      .catch(error => {
        this.invitationAlertService.postFailureAlert();
        this.redirectAfterSignIn(redirectUrl);
      });
  }

  redirectAfterSignIn(redirectUrl: string) {
    this.signInIsEnabled = true;
    this.waitingForResponse = false;
    this.router.navigateByUrl(redirectUrl);
  }
}
