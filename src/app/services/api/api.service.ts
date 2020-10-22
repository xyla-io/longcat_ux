import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface APIQueryResult {
  row_count: number;
  column_names?: string[];
  rows?: any[][];
}

export interface APIResponse {
  success: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class APIService {
  public static readonly baseURL: string = environment.apiBaseURL;
  public siteName: string;
  public errorResponseSubject: Subject<HttpErrorResponse> = new Subject();
  public client: HttpClient;

  constructor(
    httpClient: HttpClient,
  ) {
    this.siteName = environment.siteName;
    this.client = httpClient;
  }
}
