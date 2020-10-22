import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SessionService } from 'src/app/services/api/session.service';
import { CompanyReportsService, CompanyReport } from 'src/app/services/api/company-reports.service';
import { Router, Event, NavigationStart } from '@angular/router';
import {
  NavbarService,
  NavbarNode,
} from 'src/app/services/api/navbar.service';
import { NavSubmenuComponent } from '../nav-submenu/nav-submenu.component';
import { MessageService } from 'src/app/services/app/message.service';
import {
  removeCompanyDependentPrefixFromUrl,
  addCompanyDependentPrefix,
} from 'src/app/util/environment-based-routes';

interface Navbar {
  root: NavbarNode;
  children: {[x: string]: NavbarNode};
}

@Component({
  selector: 'app-nav-reports',
  templateUrl: './nav-reports.component.html',
  styleUrls: ['./nav-reports.component.scss']
})
export class NavReportsComponent implements OnInit, OnDestroy {
  private destroyed$ = new Subject();
  private retrievedReports: CompanyReport[] = [];
  private retrievedNavbarNodes: NavbarNode[] = [];
  @ViewChildren(NavSubmenuComponent) submenus: QueryList<NavSubmenuComponent>;
  navbar: Navbar;
  openChildNodeIndex = -1;
  activeReportIdentifier: string;
  breadcrumbs = [];
  openCrumbMenuIndex = -1;
  openCrumbMenuRoot: NavbarNode;
  showNavbarBreadcrumbs = false;

  @HostListener('window:click', ['$event.target']) clickOutside(target: HTMLElement) {
    // Click events inside this component and submenus use event.stopPropagation(),
    // so we can safely close any open dropdown knowing the click didn't originate from inside it
    this.closeDropdown();
  }

  closeDropdown() {
    this.openChildNodeIndex = -1;
    this.openCrumbMenuIndex = -1;
  }

  constructor(
    public sessionService: SessionService,
    public reportsService: CompanyReportsService,
    public navbarService: NavbarService,
    private router: Router,
    private messageService: MessageService,
  ) {}

  ngOnInit() {
    const isNavigationStart = (event: Event): event is NavigationStart => event instanceof NavigationStart;

    this.router.events
      .pipe(takeUntil(this.destroyed$))
      .subscribe((event: Event) => {
        if (!isNavigationStart(event)) { return; }
        const urlComponents = removeCompanyDependentPrefixFromUrl(event.url).split('/');
        if (urlComponents.length < 3 || urlComponents[1] !== 'report') {
          this.showNavbarBreadcrumbs = false;
          return;
        }
        this.showNavbarBreadcrumbs = true;
        this.activeReportIdentifier = urlComponents[2];
        this.updateNavbar();
      });

    this.reportsService.reportsObservable
      .pipe(takeUntil(this.destroyed$))
      .subscribe((reportsResult) => {
        if (reportsResult.isRefreshing) { return; }
        this.retrievedReports = reportsResult.result || [];
        this.updateNavbar();
      });

    this.navbarService.reportsNavbarObservable
      .pipe(takeUntil(this.destroyed$))
      .subscribe(observableResult => {
        if (observableResult.isRefreshing) { return; }
        this.retrievedNavbarNodes = observableResult.result || [];
        this.updateNavbar();
      });

    this.messageService.getMessage()
      .pipe(takeUntil(this.destroyed$))
      .subscribe(message => {
        if (message.channel === 'iframeClick') {
          this.closeDropdown();
        }
      });

    this.reportsService.refreshReports();
    this.navbarService.refreshNavbar();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  clickNode(index: number) {
    event.stopPropagation();
    this.submenus.forEach(menu => menu.closeChildren());
    if (this.openChildNodeIndex === index) {
      this.openChildNodeIndex = -1;
    } else {
      this.openChildNodeIndex = index;
      this.openCrumbMenuIndex = -1;
    }
  }

  hoverEnterLeaf(leafIndex: number) { this.openChildNodeIndex = -1; }

  hoverExitLeaf(leafIndex: number) { }

  hoverEnterNode(nodeIndex: number) {
    if (this.openChildNodeIndex !== -1) {
      this.openChildNodeIndex = nodeIndex;
    }
  }

  hoverExitNode(nodeIndex: number) { }

  clickBreadcrumb(crumbIndex, crumbText) {
    this.openChildNodeIndex = -1;
    if (this.openCrumbMenuIndex !== -1) {
      this.openCrumbMenuIndex = -1;
      return;
    }
    event.stopPropagation();
    this.setCrumbMenuRoot(crumbIndex);
    this.openCrumbMenuIndex = crumbIndex;
  }

  setCrumbMenuRoot(crumbIndex) {
    let root = this.navbar.root;
    for (let i = 0; i < crumbIndex; i++) {
      const target = root.targets.find(t => t.displayName === this.breadcrumbs[i]);
      root = this.navbar.children[target.identifier];
    }
    this.openCrumbMenuRoot = root;
  }

  hoverEnterCrumb(crumbIndex, crumbText) {
    if (this.openCrumbMenuIndex !== -1) {
      this.setCrumbMenuRoot(crumbIndex);
      this.openCrumbMenuIndex = crumbIndex;
    }
  }

  hoverExitCrumb(crumbIndex, crumbText) {

  }

  private updateNavbar() {
    if (!this.retrievedReports.length || !this.retrievedNavbarNodes.length) {
      this.navbar = undefined;
      this.setBreadcrumbs();
      return;
    }

    const reportDisplayNameMap = {};
    this.retrievedReports.forEach(report => { reportDisplayNameMap[report.path] = report.displayName; });

    this.retrievedNavbarNodes.forEach(node => {
      node.targets.forEach(target => {
        if (target.type === 'report') {
          target.displayName = reportDisplayNameMap[target.identifier];
        }
      });
    });
    const rootNode = NavbarService.findRootNode(this.retrievedNavbarNodes);
    this.populateNavbar(rootNode, this.retrievedNavbarNodes);

    if (this.activeReportIdentifier) {
      const activeReportPath = this.reportsService.reportPathFromIdentifier(this.activeReportIdentifier);
      this.setBreadcrumbs(activeReportPath);
    } else {
      this.setBreadcrumbs();
    }
  }

  private populateNavbar(rootNode: NavbarNode, allNodes: NavbarNode[]) {
    this.navbar = {
      root: rootNode,
      children: allNodes.reduce((record, node) => {
        if (node.identifier !== rootNode.identifier) {
          record[node.identifier] = node;
        }
        return record;
      }, {}),
    };
  }

  private isRootNode(node: NavbarNode) {
    if (!node) { return false; }
    const rootNode = NavbarService.findRootNode(this.retrievedNavbarNodes);
    return rootNode.identifier === node.identifier;
  }

  private setBreadcrumbs(reportPath?: string) {
    if (!reportPath || !this.retrievedNavbarNodes.length) {
      this.breadcrumbs = [];
      return;
    }
    let groupNode: NavbarNode = this.findParent(reportPath);
    if (!groupNode) {
      // Someone asked for an invalid report path
      this.breadcrumbs = [];
      return;
    }
    const crumbs = [groupNode.targets.find(target => target.identifier === reportPath).displayName];
    while (!this.isRootNode(groupNode)) {
      const parent = this.findParent(groupNode.identifier);
      crumbs.unshift(parent.targets.find(target => target.identifier === groupNode.identifier).displayName);
      groupNode = parent;
    }
    // Only show breadcrumbs that are longer than 1 item
    if (crumbs.length < 2) {
      this.breadcrumbs = [];
      return;
    }
    this.breadcrumbs = crumbs;
  }

  private findParent(identifier: string): NavbarNode {
    for (const node of this.retrievedNavbarNodes) {
      if (node.targets.find(target => target.identifier === identifier)) {
        return node;
      }
    }
    return null;
  }

  reportLinkBuilder(identifier: string, companyIdentifier: string): string {
    return addCompanyDependentPrefix(
      `report/${this.reportsService.reportIdentifierFromPath(identifier)}`,
      companyIdentifier);
  }
}
