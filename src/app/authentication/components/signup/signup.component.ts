import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SessionService } from 'src/app/services/api/session.service';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { InvitationAlertService } from 'src/app/services/alerts/invitation-alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, OnDestroy {
  invitationToken: string = undefined;
  fullName: string = '';
  email: string = '';
  emailLocked: boolean = false;
  password: string = '';
  confirmedPassword: string = '';
  submissionIsEnabled: boolean = false;
  waitingForResponse: boolean = false;
  submissionErrors: string[] = [];
  showPasswordRules: boolean = false;
  passwordValidation = new PasswordValidation()
  passwordValidationComplete: boolean = false;

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

    this.invitationToken = this.activatedRoute.snapshot.queryParams.invitation;
    let email = this.activatedRoute.snapshot.queryParams.email;
    if (email) {
      this.email = email;
      if (this.invitationToken) {
        this.emailLocked = true;
      }
    }
    this.submissionIsEnabled = true;
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

  onSubmitClicked() {
    this.submissionIsEnabled = false;
    this.waitingForResponse = true;
    this.sessionService.signUp({
      "name": this.fullName,
      "email": this.email,
      "password": this.password,
      "confirmedPassword": this.confirmedPassword
    })
    .then(redirectUrl => {
      if (this.invitationToken) {
        this.tryAcceptInvitation(this.invitationToken, redirectUrl);
      } else {
        this.redirectAfterSignUp(redirectUrl);
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
      this.submissionIsEnabled = true;
    });
  }

  redirectAfterSignUp(redirectUrl: string) {
    this.waitingForResponse = false;
    this.submissionIsEnabled = true;
    this.router.navigateByUrl(redirectUrl);
  }

  passwordFocused() {
    this.showPasswordRules = true;
  }

  confirmationPasswordChanged(event) {
    this.passwordValidation.setConfirmationValue(event.target.value);
    this.passwordValidationComplete = this.passwordValidation.matchesConfirmation();
  }

  passwordChanged(event) {
    this.passwordValidation.setPasswordValue(event.target.value);
    this.passwordValidationComplete = this.passwordValidation.matchesConfirmation();
  }

  tryAcceptInvitation(token: string, redirectUrl: string) {
    return this.sessionService.acceptInvitation(environment.siteName, token)
      .then(success => {
        this.invitationAlertService.postSuccessAlert();
        this.redirectAfterSignUp(redirectUrl);
      })
      .catch(error => {
        this.invitationAlertService.postFailureAlert();
        this.redirectAfterSignUp(redirectUrl);
      });
  }
}

class PasswordValidation {
  private validators = {
    meetsLength: value => value.length >= 6,
    hasLowercase: value => value.match(/[a-z]/) !== null,
    hasUppercase: value => value.match(/[A-Z]/) !== null,
    hasNumber: value => value.match(/[0-9]/) !== null,
  };

  private passwordValue: string = '';
  private confirmationValue: string = '';

  meetsLength(): boolean { return this.validators.meetsLength(this.passwordValue); }
  hasLowercase(): boolean { return this.validators.hasLowercase(this.passwordValue); }
  hasUppercase(): boolean { return this.validators.hasUppercase(this.passwordValue); }
  hasNumber(): boolean { return this.validators.hasNumber(this.passwordValue); }
  isValid(): boolean { return Object.keys(this.validators).every(key => this.validators[key](this.passwordValue) === true) }
  setPasswordValue(value: string) { this.passwordValue = value; }
  setConfirmationValue(value: string) { this.confirmationValue = value; }

  matchesConfirmation(): boolean {
    if (!this.isValid()) { return false; }
    return this.passwordValue === this.confirmationValue;
  }
}
