import { Injectable } from '@angular/core';

import { APIService, APIResponse } from 'src/app/services/api/api.service';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class CompanyLogoService {

  constructor() { }

  static get companiesURL(): string {
    return `${APIService.baseURL}/companies`;
  }

  static get subdomainLogoURL(): string {
    return `${CompanyLogoService.companiesURL}/${environment.siteName}/logo`;
  }

  static getCompanyLogoURL(companyIdentifier: string): string {
    return `${CompanyLogoService.companiesURL}/${companyIdentifier}/logo`;
  }
}
