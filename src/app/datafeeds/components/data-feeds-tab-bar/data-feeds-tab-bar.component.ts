import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SessionService } from 'src/app/services/api/session.service';

interface DataFeedTab {
  identifier: string;
  displayName: string;
  iconTag?: string;
}

@Component({
  selector: 'app-data-feeds-tab-bar',
  templateUrl: './data-feeds-tab-bar.component.html',
  styleUrls: ['./data-feeds-tab-bar.component.scss']
})
export class DataFeedsTabBarComponent implements OnInit, OnDestroy {
  dataFeedTabs: DataFeedTab[] = [
    {
      identifier: 'inbound',
      displayName: 'Inbound',
      iconTag: 'sign-in',
    }, {
      identifier: 'outbound',
      displayName: 'Outbound',
      iconTag: 'sign-out',
    }
  ];
  selectedTab: DataFeedTab = this.dataFeedTabs[0];

  private destroyed$ = new Subject();
  companyIdentifier: string;

  constructor(
    protected sessionService: SessionService,
  ) { }

  ngOnInit() {
    this.companyIdentifier = this.sessionService.currentCompanyIdentifier;
    this.sessionService.currentCompany$
      .pipe(takeUntil(this.destroyed$))
      .subscribe(companyIdentifier => {
        this.companyIdentifier = companyIdentifier;
      });
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  clickDataFeedTab(tab: DataFeedTab) {
    this.selectedTab = tab;
  }
}
