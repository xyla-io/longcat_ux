import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Message {
  channel: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private subject = new Subject<Message>();

  constructor() { }

  sendMessage(channel: string, message: string) {
    this.subject.next({
      channel: channel,
      message: message,
    });
  }

  getMessage(): Observable<Message> {
    return this.subject.asObservable();
  }
}
