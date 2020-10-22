import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DragonAPIService } from './dragon-api.service';
import { Credential, ChannelReportParameters } from '../../iomap/models/credential';
import { ObservableResult } from 'src/app/util/request-loaders/api-loaders';
import { APIResponse } from 'src/app/services/api/api.service';
import { SessionAPILoaders } from 'src/app/util/request-loaders/session-api-loaders';

interface CredentialsAPIResponse extends APIResponse {
  credentials: Credential[];
}

@Injectable()
export class CredentialService {
  private static credentialsURL = `${DragonAPIService.baseURL}/credentials`;
  private static loaderKeys = {
    credentials: 'credentials',
  };
  private apiLoaders: SessionAPILoaders;

  get credentials$(): Observable<ObservableResult<Credential[]>> {
    return this.apiLoaders.getSharedObservable(CredentialService.loaderKeys.credentials);
  }

  constructor(
    private api: DragonAPIService,
  ) {
    this.apiLoaders = new SessionAPILoaders(api);
    this.apiLoaders.createSharedObservable<Credential[]>({
      loaderKey: CredentialService.loaderKeys.credentials,
      callFunction: () => this.api.client.get(`${CredentialService.credentialsURL}`),
      responseHandler: (response) => ({ result: (response as CredentialsAPIResponse).credentials }),
      errorHandler: () => ({ result: null, error: true }),
    })
  }

  refreshCredentials() {
    this.apiLoaders.refreshLoader(CredentialService.loaderKeys.credentials);
  }

  createCredential(credential: Credential): Promise<Credential> {
    return this.api.client
      .post(CredentialService.credentialsURL, credential)
      .toPromise()
      .then(response => response as Credential)
  }

  deleteCredentialByPath(credentialPath: string): Promise<null> {
    return this.api.client
      .delete(`${CredentialService.credentialsURL}/${credentialPath}`)
      .toPromise()
      .then(() => null)
  }

  getChannelReport(parameters: ChannelReportParameters): Promise<string> {
    return this.api.client
      .post(`${CredentialService.credentialsURL}/${parameters.credentialPath}/channel-report`, parameters)
      .toPromise()
      .then(response => (response as any).report)
  }
}

