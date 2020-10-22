import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavReportsComponent } from './nav-reports.component';

describe('NavReportsComponent', () => {
  let component: NavReportsComponent;
  let fixture: ComponentFixture<NavReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
