import { Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";

export interface APIError {
  message: string,
}

function isAPIError(response: any): response is APIError {
  if (typeof response !== 'object') { return false; }
  return 'message' in response && typeof response.message === 'string';
}

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  constructor() { }

  presentError(error: any) {
    if (error instanceof HttpErrorResponse) {
      if (isAPIError(error.error)) {
        this.presentAPIError(error.error);
        return;
      }
      console.dir(error);
      alert(`${error}`);
      return;
    }
    alert(error);
  }

  presentAPIError(error: APIError) {
    alert(error.message);
  }

  getDisplayableErrors(httpError: HttpErrorResponse): string[] {
    let message: string = httpError && httpError.error && httpError.error.message;
    if (!message) { return null; }
    return this.convertAPIErrorMessage(message);
  }

  private convertAPIErrorMessage(message: string): string[] {
    let lines = message.split('\n').filter(line => line !== '');
    let displayErrors = [];
    if (lines.length > 1) {
      let firstError = lines[0];
      if (firstError.match(/Invalid.*parameters\./) !== null) {
        lines.shift();
        displayErrors = this.mapValidationErrorsToMessages(lines);
      } else {
        displayErrors = this.normalizeErrorStrings(lines);
      }
    } else {
      displayErrors = this.normalizeErrorStrings(lines);
    }
    return displayErrors;
  }

  private normalizeErrorStrings(errors: string[]): string[] {
    let normalizedErrors = errors.map(error => {
      error = error.trim();
      error = error.replace('username', 'email');
      if (error.endsWith('.')) { error = error.substring(0, error.length - 1) }
      return error;
    });
    return normalizedErrors;
  }

  private mapValidationErrorsToMessages(errors: string[]): string[] {
    if (errors.includes('instance.password must equal instance.confirmedPassword')) {
      return ["Passwords do not match"];
    }

    if (errors.includes('Passwords must')) {
      return this.mapPasswordErrors(errors);
    }

    let messages = errors.map(error => {
      error = error.trim();
      error = error.replace('instance.','');
      error = error.replace('does not meet minimum length of 1','is required');
      error = error.charAt(0).toUpperCase() + error.slice(1);
      return error;
    });
    return messages;
  }

  private mapPasswordErrors(errors: string[]): string[] {
      errors = errors.slice(errors.findIndex(error => error === 'This password does not'));
      let messages = errors.map(error => {
        error = error.trim();
        error = error.replace('contain', '• ');
        return error;
      });
      messages[0] = 'Your password must contain:';
      return messages;
  }
}
