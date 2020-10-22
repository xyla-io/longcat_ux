import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, Subject, pipe } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { QueryExportService, QueryExport, QueryExportResponse } from 'src/app/services/api/query-export.service';
import { DataFeedsAlertService } from 'src/app/services/alerts/data-feeds-alert.service';

@Component({
  selector: 'app-data-feeds-outbound',
  templateUrl: './data-feeds-outbound.component.html',
  styleUrls: ['./data-feeds-outbound.component.scss']
})
export class DataFeedsOutboundComponent implements OnInit, OnDestroy {
  @Input() companyIdentifier: string;
  queryExportsSubscription: Subscription;
  queryExports: QueryExport[] = [];
  isLoadingQueryExports: boolean = true;
  private destroyed = new Subject();

  constructor(
    private queryExportService: QueryExportService,
    private dataFeedsAlertService: DataFeedsAlertService,
  ) { }

  ngOnInit() {
    this.queryExportsSubscription = this.queryExportService.exportsObservable
      .pipe(takeUntil(this.destroyed))
      .subscribe(observableResult => {
        if (!observableResult.result) {
          this.queryExports = [];
          return;
        }
        let queryExportResponse = observableResult.result as QueryExportResponse;
        this.queryExports = queryExportResponse.exports;
        this.isLoadingQueryExports = false;
      });

    this.queryExportService.refreshExports(this.companyIdentifier);
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  downloadStarted() {
    this.queryExportService.refreshExports(this.companyIdentifier);
  }

  /**
   * @implements URLProvider.getURL()
   */
  async getURL(key: string): Promise<string|null> {
    let resource  = this.queryExports.find(queryExport => queryExport.path === key);
    if (!resource) { return null; }
    try {
      let response = await this.queryExportService.getQueryExportData(resource.path);
      return response.signedURL;
    } catch (error) {
      this.dataFeedsAlertService.postExportNotAvailable();
      console.error(error);
      return null;
    }
  }

  /**
   * @implements URLProvider.getResourceName()
   */
  getResourceName(key: string): string {
    let resource = this.queryExports.find(queryExport => queryExport.path === key);
    return resource ? resource.displayName.toLowerCase().split(' ').join('_') : 'export';
  }

  /**
   * @implements URLProvider.getDisplayName()
   */
  getDisplayName(key: string): string {
    let resource = this.queryExports.find(queryExport => queryExport.path === key);
    return resource ? resource.displayName : 'Data Export';
  }
}
