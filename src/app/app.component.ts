import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { ErrorService } from 'src/app/services/alerts/error.service';
import { SessionService } from 'src/app/services/api/session.service';
import { User } from 'src/app/services/api/user.service';
import { CompanyLogoService } from 'src/app/services/api/company-logo.service';
import { AccessService, Link } from 'src/app/services/access/access.service';
import { TrackingService } from 'src/app/services/integration/tracking.service';
import { environment } from 'src/environments/environment';
import { LoadingService } from 'src/app/services/app/loading.service';
import { AbdetectService } from 'src/app/services/integration/abdetect.service';
import { TaggingService } from 'src/app/services/api/tagging.service';
import { EmbedsService } from './services/api/embeds.service';
import { UserAlertService, UserAlertType } from './services/alerts/user-alert.service';
import { newExploreReport } from './reports/models/report';
import { CompanyReportsService, LayoutOrientation } from './services/api/company-reports.service';
import { NavbarService } from './services/api/navbar.service';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  logoURL: string;
  signOutIsEnabled = true;
  destroyed = new Subject();
  userMenuLinks: Link[] = [];
  navbarMenuLinks: Link[] = [];
  canSwitchCompanies = false;
  hasShownAdBlockerWarning = false;
  untaggedCampaignCount: number;
  currentYear: number = new Date().getFullYear();

  constructor(
    public sessionService: SessionService,
    private loadingService: LoadingService,
    private errorService: ErrorService,
    private accessService: AccessService,
    private trackingService: TrackingService,
    private abdetect: AbdetectService,
    private router: Router,
    private taggingService: TaggingService,
    private embedsService: EmbedsService,
    private alertService: UserAlertService,
    private companyReportsService: CompanyReportsService,
    private navbarService: NavbarService,
  ) { }

  ngOnInit() {
    this.setCompanySpecificDetails(this.sessionService.currentCompanyIdentifier);
    this.setUserSpecificDetails(this.sessionService.currentUser);

    this.sessionService.session$
      .pipe(takeUntil(this.destroyed))
      .subscribe(session => {
        if (session) {
          this.trackingService.identify(session);
          if (this.abdetect.adBlockerDetected && !this.hasShownAdBlockerWarning) {
            this.abdetect.showAdBlockModal();
            this.hasShownAdBlockerWarning = true;
          }
        } else {
          this.router.navigate(['/']);
        }

        this.refreshRouteLinks(session);
        this.setUserSpecificDetails(session);
        this.setCompanySpecificDetails(this.sessionService.currentCompanyIdentifier);
      });

    this.sessionService.currentCompany$
      .pipe(takeUntil(this.destroyed))
      .subscribe(companyIdentifier => {
        this.refreshRouteLinks(this.sessionService.currentUser);
        this.setCompanySpecificDetails(this.sessionService.currentCompanyIdentifier);
      });

    this.taggingService.getEntityObservable('campaign')
      .pipe(takeUntil(this.destroyed))
      .subscribe(response => {
        if (response.isRefreshing || !response.result) {
          this.untaggedCampaignCount = undefined;
          this.refreshRouteLinks(this.sessionService.currentUser);
          return;
        }
        const tagIndex = response.result.column_names.indexOf('campaign_tag');
        if (tagIndex < 0) { return; }
        this.untaggedCampaignCount = response.result.rows.reduce((untagged, row) => {
          if (!row[tagIndex]) { return untagged + 1; }
          return untagged;
        }, 0);
        this.refreshRouteLinks(this.sessionService.currentUser);
      });
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  get currentUser(): User {
    return this.sessionService.currentUser;
  }

  isSuperUser(): boolean {
    return this.sessionService.currentUser 
      && this.sessionService.currentUser.roles
      && this.sessionService.currentUser.roles.includes('super');
  }

  setUserSpecificDetails(user?: User) {
    const userExistsAndHasCompanies = user && user.companies.length > 1;
    this.canSwitchCompanies = environment.companySwitchingEnabled
      && userExistsAndHasCompanies
      && this.accessService.userCanAccessPath('companies', 'select', user);
  }

  setCompanySpecificDetails(companyIdentifier: string) {
    if (!companyIdentifier) {
      this.logoURL = CompanyLogoService.subdomainLogoURL;
    } else {
      this.logoURL = CompanyLogoService.getCompanyLogoURL(companyIdentifier);
    }
  }

  onSignOutClicked() {
    this.signOutIsEnabled = false;
    this.sessionService.signOut()
      .then(() => {
        this.signOutIsEnabled = true;
      })
      .catch(error => {
        this.errorService.presentError(error);
        this.signOutIsEnabled = true;
      });
  }

  refreshRouteLinks(user?: User) {
    this.userMenuLinks = this.accessService.
      filterPathsByAccessRequirements([
        {
          path: 'manage/users',
          companyDependent: true,
          displayName: 'Manage Users',
          iconTag: 'users',
        },
        {
          path: 'manage/assets',
          companyDependent: true,
          displayName: 'Entity Metadata',
          iconTag: 'tag',
          notificationCount: this.untaggedCampaignCount,
        },
      ], user);
    
    this.navbarMenuLinks = this.accessService
      .filterPathsByAccessRequirements([
        {
          path: 'manage/rules',
          companyDependent: true,
          displayName: 'Rules',
          iconTag: 'gavel',
          superOnly: true,
        },
        {
          path: 'manage/tags',
          companyDependent: true,
          displayName: 'Tags',
          iconTag: 'tags',
          superOnly: true,
        },
        {
          path: 'manage/datafeeds',
          companyDependent: true,
          displayName: 'Feeds',
          iconTag: 'database',
        },
      ].filter(item => !item.superOnly || (this.isSuperUser() && this.sessionService.currentCompanyIdentifier)) , user);
  }

  async onClickEditRules(event: any) {
    const signedEmbeds = await this.embedsService.signEmbeds({
      datadragon: {
        sso: { companyIdentifier: this.sessionService.currentCompanyIdentifier }
      }
    });
    const { signedURL, message } = signedEmbeds.datadragon.sso;
    const errorAlert = () => this.alertService.postAlert({
      alertType: UserAlertType.error,
      header: 'There was a problem accessing the rules engine',
      autoCloseSeconds: 5,
    });
    if (!signedURL) {
      console.error(message);
      errorAlert();
      return;
    }
    console.log(signedURL);
    window.open(signedURL, '_blank');
  }

  onClickExplore(event: any) {
    const companyIdentifier = this.sessionService.currentCompanyIdentifier;
    if (!companyIdentifier) { return; }
    const now = new Date();
    const reportIdentifier = uuid();
    const report =  newExploreReport(companyIdentifier, reportIdentifier, now);
    this.companyReportsService.addLocalReport(report);
    this.companyReportsService.refreshReports();
    this.navbarService.refreshNavbar();
    this.router.navigate([`/company/${companyIdentifier}/report/${reportIdentifier}`]);
  }
}

