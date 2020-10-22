import { Injectable } from '@angular/core';
import { DragonAPIService } from './dragon-api.service';
import { Certificate } from '../../iomap/models/certificate';
import { map } from 'rxjs/operators';
import { APIResponse } from 'src/app/services/api/api.service';
import { Observable } from 'rxjs';
import { SessionService } from 'src/app/services/api/session.service';
import { APILoaders, ObservableResult } from 'src/app/util/request-loaders/api-loaders';

export interface CertificateUpdate {
  name: string;
  file?: File;
}

interface CertificateAPIResponse extends APIResponse {
  certificate: Certificate;
}

interface CertificatesAPIResponse extends APIResponse {
  certificates: Certificate[];
}

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  private static certificatesURL = `${DragonAPIService.baseURL}/certificates`;
  private static loaderKeys = {
    certificates: 'certificates',
  };
  private apiLoaders: APILoaders;

  get certificates$(): Observable<ObservableResult<Certificate[]>> {
    return this.apiLoaders.getSharedObservable(CertificateService.loaderKeys.certificates);
  }

  constructor(
    private api: DragonAPIService,
    private longcatSessionService: SessionService,
  ) {
    this.apiLoaders = new APILoaders(api, { companyProvider: this.longcatSessionService });
    this.apiLoaders.createSharedObservable<Certificate[]>({
      loaderKey: CertificateService.loaderKeys.certificates,
      callFunction: () => this.api.client.get(`${CertificateService.certificatesURL}`),
      responseHandler: (response) => ({ result: (response as CertificatesAPIResponse).certificates }),
      errorHandler: () => ({ result: [] }),
    })
  }

  createCertificate(certificateUpdate: CertificateUpdate) {
    let formData = new FormData();
    if (certificateUpdate.file) {
      formData.append('zipFile', certificateUpdate.file, certificateUpdate.file.name);
    }
    formData.append('name', certificateUpdate.name);

    return this.api.client.post(CertificateService.certificatesURL, formData)
      .toPromise()
      .then(response => (response as CertificateAPIResponse).certificate);
  }

  deleteById(certificateID): Promise<boolean> {
    return this.api.client
      .delete(`${CertificateService.certificatesURL}/${certificateID}`)
      .toPromise()
      .then(response => (response as APIResponse).success)
  }

}
