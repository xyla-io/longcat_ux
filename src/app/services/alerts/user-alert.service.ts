import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export enum UserAlertType {
  info = 'info',
  warning = 'warning',
  error = 'error',
  success = 'success',
}

export interface UserAlert {
  alertType: UserAlertType;
  icon?: string;
  header?: string;
  body?: string;
  autoCloseSeconds?: number;
  replacementKey?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserAlertService {
  private subject = new Subject<UserAlert>();

  constructor() { }

  postAlert(userAlert: UserAlert) {
    this.subject.next(userAlert);
  }

  getAlert(): Observable<UserAlert> {
    return this.subject.asObservable();
  }
}
