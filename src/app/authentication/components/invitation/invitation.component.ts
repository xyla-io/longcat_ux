import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { UserService } from 'src/app/services/api/user.service';
import { SessionService } from 'src/app/services/api/session.service';
import { InvitationAlertService } from 'src/app/services/alerts/invitation-alert.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.css']
})
export class InvitationComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private invitationAlertService: InvitationAlertService,
  ) {
  }

  ngOnInit() {
    let token = this.activatedRoute.snapshot.params.token;
    this.sessionService.syncSession().then(user => {
      let email = this.activatedRoute.snapshot.queryParams.email;

      if (!email) {
        this.invitationAlertService.postFailureAlert();
        this.router.navigate(['']);
        return;
      }

      if (!user) {
        this.navigateToSignup(token, email);
        return;
      }

      if (user.email.toLowerCase() === email.toLowerCase()) {
        this.sessionService.acceptInvitation(environment.siteName, token)
          .then(success => {
            this.invitationAlertService.postSuccessAlert();
            this.router.navigate(['']);
          })
          .catch(error => {
            this.invitationAlertService.postFailureAlert();
            this.router.navigate(['']);
          });
      } else {
        // Different user logged in
        this.sessionService.signOut(false).then(() => {
          this.navigateToSignup(token, email);
        });
      }
    });
  }

  navigateToSignup(token: string, preFillEmail?: string) {
    this.invitationAlertService.postSignUpAlert();

    let navigationExtras: NavigationExtras = {
      queryParams: { invitation: token, }
    };
    if (preFillEmail) {
      navigationExtras.queryParams.email = preFillEmail;
    }
    this.router.navigate(['/signup'], navigationExtras);
  }
}
