import { NbMenuService, NbMenuItem } from '@nebular/theme';
import { Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

export interface MenuItem {
  identifier: string;
  nbMenuItem: NbMenuItem;
}

export interface MenuClickHandler {
  nbMenuService: NbMenuService;
  menuItemClicked: (string, NbMenuItem) => void;
}

export class NbMenuHelper {
  menuItems: MenuItem[];
  clickSubscription: Subscription;
  menuTag: string;

  constructor(
    menuClickHandler: MenuClickHandler,
    menuItems: MenuItem[],
  ) {
    this.menuTag = uuid();
    this.menuItems = menuItems;
    this.clickSubscription = menuClickHandler.nbMenuService.onItemClick()
      .pipe(
        tap(({ tag }) => console.log('clicked', tag)),
        filter(({ tag }) => tag === this.menuTag),
        map(({ item: { title } }) => this.menuItems.find(item => item.nbMenuItem.title === title)),
      )
      .subscribe(menuItem => menuClickHandler.menuItemClicked(menuItem.identifier, menuItem.nbMenuItem));
  }

  unsubscribe() {
    this.clickSubscription.unsubscribe();
  }

  get nbMenuItems(): NbMenuItem[] {
    return this.menuItems.map(item => item.nbMenuItem);
  }
}
