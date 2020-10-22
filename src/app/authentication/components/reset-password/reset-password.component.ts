import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService, ResetPasswordParameters } from 'src/app/services/api/user.service';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { SessionService } from 'src/app/services/api/session.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private routeParamsSubscription: Subscription;

  submissionIsEnabled: boolean = false;
  waitingForResponse: boolean = false;
  submissionErrors: string[] = [];

  parameters: ResetPasswordParameters = {
    password: '',
    confirmedPassword: '',
    userID: '',
    token: ''
  };

  constructor(    
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private errorService: ErrorService,
    private sessionService: SessionService
  ) { }

  ngOnInit() {
    this.submissionIsEnabled = true;
    
    this.routeParamsSubscription = this.route.paramMap.subscribe((params: ParamMap) => {
      this.parameters.userID = params.get('userID');
      this.parameters.token = params.get('token');
    });
  }
  
  ngOnDestroy() {
    this.routeParamsSubscription.unsubscribe();
  }

  onConfirmClicked() {
    this.submissionIsEnabled = false;
    this.waitingForResponse = true;
    this.userService.resetPassword(this.parameters)
    .then(message => {
      this.waitingForResponse = false;
      this.submissionIsEnabled = true;
      alert(message.message);
      this.router.navigate(['/signin']);
    })
    .catch(error => {
      this.submissionIsEnabled = true;
      this.waitingForResponse = false;
      let displayErrors = this.errorService.getDisplayableErrors(error);
      if (displayErrors !== null) {
        this.submissionErrors = displayErrors;
      } else {
        this.errorService.presentError(error);
      }
    });
  }
}
