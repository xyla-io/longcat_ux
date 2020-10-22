import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  Input,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from 'src/app/services/api/user.service';
import { CompanyService, CompanyUsersResponse, Invitation, InvitationResponse } from 'src/app/services/api/company.service';
import { AccessService } from 'src/app/services/access/access.service';
import { SessionService } from 'src/app/services/api/session.service';
import { AdminAlertService } from 'src/app/services/alerts/admin-alert.service';
import { DateUtil } from 'src/app/util/date.util';

interface UserColumn {
  header: String;
  name: String;
  view: {
    width: String;
  }
}

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss']
})
export class ListUsersComponent implements OnInit, OnDestroy {
  usersResult: CompanyUsersResponse;
  isLoadingUsers: boolean = true;

  resendBusyIndices = new Set();
  newInvitationState = {
    email: "",
    error: false,
    dropdownOpen: false,
    sending: false,
  };

  private destroyed = new Subject();
  
  columns: UserColumn[] = [
    {
      header: "Email",
      name: "email",
      view: {
        width: "four",
      }
    },
    {
      header: "Name",
      name: "name",
      view: {
        width: "six",
      }
    },
    {
      header: "",
      name: "status",
      view: {
        width: "four",
      }
    },
    {
      header: "Access",
      name: "access",
      view: {
        width: "two",
      }
    },
  ];

  constructor(
    private companyService: CompanyService,
    private accessService: AccessService,
    private adminAlertService: AdminAlertService,
    protected sessionService: SessionService,
  ) { 
  }

  ngOnInit() {
    this.companyService.usersObservable
      .pipe(takeUntil(this.destroyed))
      .subscribe(observableResult => {
        this.isLoadingUsers = false;
        let usersResult = observableResult.result as CompanyUsersResponse;
        if (usersResult) {
          this.sortUsersInPlace(usersResult);
          usersResult.invitations = usersResult.invitations.map(invitation => {
            invitation.invitationDate = DateUtil.formatDateAndTime(invitation.invitationDate);
            return invitation;
          });
        } 
        this.usersResult = usersResult;
      });
    this.companyService.refreshUsers();
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  shouldShowAccessToggle(user: User): boolean {
    return (this.sessionService.currentUser._id !== user._id);
  }

  isUserEnabled(user: User): boolean {
    return user.groups.some(group => {
      let components = AccessService.componentsFromPath(group.path);
      return (components.length > 3 && components[3] === CompanyService.getDefaultGroupName());
    });
  }

  accessToggleChanged(event, user: User) {
    let checked = event.target.checked;
    if (typeof checked !== 'boolean') { return; }
    if (checked) {
      this.addUserToStandardGroup(user);
    } else {
      this.deactivateUserFromCompany(user);
    }
  }

  newInvitationDropdownOpenChange(isOpen) {
    this.newInvitationState.dropdownOpen = isOpen;
  }

  newInvitationEmailChanged(event) {
    this.newInvitationState.email = event.target.value;
    this.newInvitationState.error = false;
  }

  clickSendNewInvitation() {
    if (this.newInvitationState.sending) { return; }
    const inviteEmail = this.newInvitationState.email;
    if (!this.isValidEmail(inviteEmail)) {
      this.newInvitationState.error = true;
      return;
    }
    this.newInvitationState.dropdownOpen = false;
    this.newInvitationState.sending = true;
    this.companyService.inviteUserToCompany(
      inviteEmail
    ).then((response: InvitationResponse) => {
      if (response.success) {
        this.adminAlertService.postInvitationSendSuccessAlert(inviteEmail);
      } else {
        this.adminAlertService.postInvitationSendFailureAlert(inviteEmail);
      }
      this.newInvitationState.sending = false;
      this.newInvitationState.email = "";
    }).catch(error => {
      this.adminAlertService.postInvitationSendFailureAlert(inviteEmail);
      this.newInvitationState.sending = false;
      this.newInvitationState.email = "";
    });
  }

  clickResendInvitation(invitation: Invitation, i: number) {
    if (this.resendBusyIndices.has(i)) { return; }
    this.resendBusyIndices.add(i);
    this.companyService.inviteUserToCompany(
      invitation.email
    ).then((response: InvitationResponse) => {
      if (response.success) {
        this.adminAlertService.postInvitationSendSuccessAlert(invitation.email);
      } else {
        this.adminAlertService.postInvitationSendFailureAlert(invitation.email);
      }
      this.resendBusyIndices.delete(i);
    }).catch(error => {
      this.adminAlertService.postInvitationSendFailureAlert(invitation.email);
      this.resendBusyIndices.delete(i);
    });
  }

  clickCopyInvitationLink(event, invitation: Invitation) {
    let linkElement = (() => {
      if (event.target.tagName === 'I') {
        return event.target.parentNode.parentNode.firstChild;
      } else {
        return event.target.parentNode.firstChild;
      }
    })();
    linkElement.select();
    document.execCommand('copy');
    this.adminAlertService.postInvitationLinkCopiedAlert(invitation.email);
  }

  getAccessToggleTooltipText(user: User) {
    return this.isUserEnabled(user) ?
      `Toggle to revoke access for ${user.email}` :
      `Toggle to grant access to ${user.email}`;
  }

  private addUserToStandardGroup(user: User) {
    this.companyService.addUserToStandardGroup(user.email)
      .then(response => {
        if (response.success) {
          this.adminAlertService.postAccessGrantedSuccessAlert(user.email);
        } else {
          this.adminAlertService.postAccessUpdateFailureAlert(user.email);
        }
      })
      .catch(error => {
        this.adminAlertService.postAccessUpdateFailureAlert(user.email);
      });
  }

  private deactivateUserFromCompany(user: User) {
    this.companyService.deactivateUserFromCompany(user.email)
      .then(response => {
        if (response.success) {
          this.adminAlertService.postAccessRevokedSuccessAlert(user.email);
        } else {
          this.adminAlertService.postAccessUpdateFailureAlert(user.email);
        }
      })
      .catch(error => {
        this.adminAlertService.postAccessUpdateFailureAlert(user.email);
      });
  }

  private postAccessUpdateError(userEmail: string) {
    this.adminAlertService.postAccessUpdateFailureAlert(userEmail);
  }

  private sortUsersInPlace(usersResult: CompanyUsersResponse) {
    if (!usersResult) { return null; }
    usersResult.users.sort((a, b) => {
      if (a.email === this.sessionService.currentUser.email) { return -1; }
      if (b.email === this.sessionService.currentUser.email) { return 1; }
      return a.name < b.name ? -1 : 1;
    });
    usersResult.invitations.sort((a, b) => {
      return a.invitationDate > b.invitationDate ? -1 : 1;
    });
  }

  makeInvitationLink(invitation: Invitation) {
    return this.companyService.makeInvitationLink(
      invitation.token,
      invitation.email,
    );
  }

  isValidEmail(email: string): boolean {
    let emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return email.match(emailRegex) !== null
  }
}
