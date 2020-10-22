import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavBreadcrumbsSubmenuComponent } from './nav-breadcrumbs-submenu.component';

describe('NavBreadcrumbsSubmenuComponent', () => {
  let component: NavBreadcrumbsSubmenuComponent;
  let fixture: ComponentFixture<NavBreadcrumbsSubmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavBreadcrumbsSubmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBreadcrumbsSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
