import { Injectable } from '@angular/core';

export interface EventTemplateEditingValidation {
  isValid: boolean;
  message?: string;
}

export interface EventTemplateUpdate<T> {
  inputTemplate: T;
  outputTemplate: T;
}

export interface EventTemplateUpdateApplied {
  success: boolean;
  info: string;
}

@Injectable({
  providedIn: 'root'
})
export class EditingService {

  constructor() { }
}
