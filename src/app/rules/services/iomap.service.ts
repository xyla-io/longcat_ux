import { Injectable } from '@angular/core';
import { DragonAPIService } from './dragon-api.service';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { APIResponse } from 'src/app/services/api/api.service';
import { IOReportColumnEnum, IOAccountMapping } from 'src/app/util/reports/io-report';
import { ChannelOps, ChannelEnum } from '../../iomap/models/channel';
import { Credential } from '../../iomap/models/credential';
import { AccessService } from 'src/app/services/access/access.service';
import { IOEntityReport } from 'src/app/util/reports/io-entity-report';
import { UserAlertService, UserAlertType } from 'src/app/services/alerts/user-alert.service';

interface IOMapReportAPIResponse extends APIResponse {
  report: string;
  metadata: {
    credential: string;
    error: string;
    map: string;
  }[]
}

export interface CacheOptions {
  cacheexpire?: number;
  cachetime?: number;
}

@Injectable({
  providedIn: 'root'
})
export class IOMapService {

  private static iomapURL = `${DragonAPIService.baseURL}/iomap`;
  entityReport: IOEntityReport;

  constructor(
    private api: DragonAPIService,
    private userAlertService: UserAlertService,
  ) {}

  getEntityReport(accounts: Credential[], cacheOptions?: CacheOptions): Observable<IOEntityReport> {
    const channels = Array.from(new Set(accounts.map(account => account.target)));
    const entityColumns = ChannelOps.getEntityColumns(channels);
    return this.getRows(accounts.map(account => account.path), entityColumns, cacheOptions)
      .pipe(map(({csv, accountMapping}) => {
        const report = new IOEntityReport();
        this.entityReport = report;
        report.addCSV(csv, accountMapping);
        return report;
      }));
  }

  private getRows(accountPaths: string[], columns: IOReportColumnEnum[], cacheOptions: CacheOptions={}): Observable<{csv: string, accountMapping: IOAccountMapping}> {
    const queryParams: Record<string, string> = {};
    if (typeof cacheOptions.cachetime === 'number') {
      queryParams.cachetime = String(cacheOptions.cachetime);
    }
    if (typeof cacheOptions.cacheexpire === 'number') {
      queryParams.cacheexpire = String(cacheOptions.cacheexpire);
    }
    const url = `${IOMapService.iomapURL}/report`;
    const accountMapping: IOAccountMapping = {};
    const credentials = accountPaths.reduce((credentials, accountPath) => {
      const accountComponents = AccessService.componentsFromPath(accountPath)
      const channel = accountComponents[3] as ChannelEnum;
      const accountName = accountComponents[4].replace('@', '.at.');
      const reporterClass = ChannelOps.channelOptions[channel].reporterClass;
      const identifier = `${accountName}@${reporterClass}`;
      accountMapping[identifier] = { accountPath, channel, accountName };
      credentials[identifier] = accountPath;
      return credentials;
    }, {});
    return this.api.client.post(url, {
        columns,
        credentials,
      },{
        params: queryParams,
      }).pipe(
        map(response => {
          const { metadata, report: csv } = (response as IOMapReportAPIResponse);
          metadata.forEach(entry => {
            if (!entry.error) { return; }
            this.userAlertService.postAlert({
              alertType: UserAlertType.warning,
              header: 'Loading Error',
              body: `There was a problem loading Campaign and Ad Group information for the ${accountMapping[entry.credential].accountName} account on ${ChannelOps.channelOptions[accountMapping[entry.credential].channel].displayName}`,
            });
          })
          return { csv, accountMapping };
        }),
        catchError(error => {
          if (error.status === 403) {
            throw error;
          }
          console.error(error);
          this.userAlertService.postAlert({
            alertType: UserAlertType.error,
            header: 'Loading Error',
            body: 'There was a problem loading Campaign and Ad Group information',
          });
          throw error;
        })
      );
  }
}
