import { Injectable } from '@angular/core';

export enum ReportElementType {
  Layout = 'layout',
  XylaContent = 'xyla_content',
  ModeContent = 'mode_content',
  PeriscopeContent = 'periscope_content',
}

export interface ReportElement {
  type: ReportElementType;
  [x: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportElementService {

  constructor() { }
}
