import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ViewChildren,
  QueryList,
} from '@angular/core';
import { NavbarNode, NavbarNodeChild } from 'src/app/services/api/navbar.service';
import { CompanyReportsService } from 'src/app/services/api/company-reports.service';
import { SessionService } from 'src/app/services/api/session.service';

@Component({
  selector: 'app-nav-breadcrumbs-submenu',
  templateUrl: './nav-breadcrumbs-submenu.component.html',
  styleUrls: ['./nav-breadcrumbs-submenu.component.css']
})
export class NavBreadcrumbsSubmenuComponent implements OnInit {

  @Input('isMenuOpen') isMenuOpen: boolean;
  @Input('parent') parent: NavbarNode;
  @Input('children') children: {[x: string]: NavbarNode};
  @Input('linkBuilder') linkBuilder: Function;
  @Output() itemSelected = new EventEmitter<NavbarNodeChild>();
  @ViewChildren(NavBreadcrumbsSubmenuComponent) submenus: QueryList<NavBreadcrumbsSubmenuComponent>;

  openChildNodeIndex: number = -1;

  constructor(
    public reportsService: CompanyReportsService,
    private sessionService: SessionService,
  ) { }

  ngOnInit() {
  }

  getLink(child: NavbarNode): string {
    if (this.linkBuilder) {
      return this.linkBuilder(child.identifier, this.sessionService.currentCompanyIdentifier);
    }
    return child.identifier;
  }

  onItemSelected(item: NavbarNodeChild) { this.itemSelected.emit(item); }

  clickLeaf(index: number) { this.itemSelected.emit(this.parent.targets[index]); }

  clickNode(index: number) { event.stopPropagation(); }

  hoverEnterLeaf(leafIndex: number) { this.openChildNodeIndex = -1; }

  hoverExitLeaf(leafIndex: number) {}

  hoverEnterNode(nodeIndex: number) { this.openChildNodeIndex = nodeIndex; }

  hoverExitNode(nodeIndex: number) {}

  closeChildren() {
    this.openChildNodeIndex = -1;
    this.submenus.forEach(menu => menu.closeChildren());
  }
}
