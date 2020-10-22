import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { User } from 'src/app/services/api/user.service';
import { SessionService } from 'src/app/services/api/session.service';
import { AccessService, AccessRequirement, Link } from 'src/app/services/access/access.service';
import { TrackingService, TrackingEvents } from 'src/app/services/integration/tracking.service';

@Component({
  selector: 'app-entity-manager',
  templateUrl: './entity-manager.component.html',
  styleUrls: ['./entity-manager.component.css']
})
export class EntityManagerComponent implements OnInit, OnDestroy {
  entityTypeLinks: Link[] = [];
  routeEntity: string;
  companyIdentifier: string;

  private destroyed = new Subject();

  constructor(
    private accessService: AccessService,
    private route: ActivatedRoute,
    private router: Router,
    protected sessionService: SessionService,
    private trackingService: TrackingService,
  ) { 
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.routeEntity = data.entity;
      this.refreshEntityTypeLinks(this.sessionService.currentUser);
    });

    this.sessionService.currentCompany$
      .pipe(takeUntil(this.destroyed))
      .subscribe(companyIdentifier => {
        this.companyIdentifier = companyIdentifier;
        this.trackPageLoad(this.companyIdentifier);
      });
    this.companyIdentifier = this.sessionService.currentCompanyIdentifier;
    this.trackPageLoad(this.companyIdentifier);
  }

  trackPageLoad(companyIdentifier: string) {
    if (!companyIdentifier) { return; }
    this.trackingService.track(TrackingEvents.TagsMetadataPageLoaded, {
      company: companyIdentifier,
    })
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  refreshEntityTypeLinks(user?: User) {
    this.entityTypeLinks = this.accessService.filterPathsByAccessRequirements([
      {
        path: 'manage/assets/campaign',
        displayName: 'Campaigns',
        entity: 'campaign',
        companyDependent: true,
      },
      // {
      //   path: 'manage/assets/creative',
      //   displayName: 'Creatives',
      //   entity: 'ad',
      //   companyDependent: true,
      // },
    ], user);

    if (!this.routeEntity && this.entityTypeLinks.length) {
      this.router.navigateByUrl(this.entityTypeLinks[0].path);
    }
  }
}
