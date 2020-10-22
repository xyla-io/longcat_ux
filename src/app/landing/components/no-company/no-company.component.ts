import { Component, OnInit, OnDestroy } from '@angular/core';
import { SessionService } from 'src/app/services/api/session.service';
import { Router } from '@angular/router';
import { UserService, User } from 'src/app/services/api/user.service';

@Component({
  selector: 'app-no-company',
  templateUrl: './no-company.component.html',
  styleUrls: ['./no-company.component.css']
})
export class NoCompanyComponent implements OnInit, OnDestroy {
  refreshTimerHandle: any; 

  constructor(
    private sessionService: SessionService,
    private router: Router
  ) { }

  ngOnInit() {
    if (this.userIsAuthorized(this.sessionService.currentUser)) {
      this.router.navigate(['/']);
      return
    }

    this.refreshTimerHandle = setInterval(() => {
      this.sessionService.syncSession()
        .then(session => {
          if (this.userIsAuthorized(session)) {
            this.router.navigate(['/']);
            clearInterval(this.refreshTimerHandle);
            this.refreshTimerHandle = null;
          }
        });
    }, 5000);
  }

  userIsAuthorized(user?: User): boolean {
    return UserService.userCanSeeCompany(
      this.sessionService.currentUser,
      this.sessionService.currentCompanyIdentifier);
  }

  ngOnDestroy() {
    if (this.refreshTimerHandle) {
      clearInterval(this.refreshTimerHandle);
    }
  }
}
