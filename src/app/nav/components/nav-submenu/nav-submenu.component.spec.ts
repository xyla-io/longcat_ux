import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavSubmenuComponent } from './nav-submenu.component';

describe('NavSubmenuComponent', () => {
  let component: NavSubmenuComponent;
  let fixture: ComponentFixture<NavSubmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavSubmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavSubmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
